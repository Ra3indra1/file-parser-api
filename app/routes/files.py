from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from datetime import datetime

from app.database import get_db
from app.models import File, FileStatus
from app.schemas import FileResponse, FileProgress, FileContent, FileList
from app.workers import parse_file_task
from app.utils import get_file_type

router = APIRouter(prefix="/files", tags=["files"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=FileResponse)
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    db: Session = Depends(get_db)
):
    """Upload a file and start processing"""
    
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Get file info
    file_content = await file.read()
    file_size = len(file_content)
    file_type = get_file_type(file.filename)
    
    # Create file record
    db_file = File(
        filename=file.filename,
        original_filename=file.filename,
        file_size=file_size,
        file_type=file_type,
        status=FileStatus.uploading
    )
    
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    # Save file to disk
    file_path = os.path.join(UPLOAD_DIR, f"{db_file.id}_{file.filename}")
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    # Start background processing
    parse_file_task.delay(db_file.id, file_path, file_type)
    
    return db_file

@router.get("/", response_model=FileList)
def list_files(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[FileStatus] = None,
    db: Session = Depends(get_db)
):
    """List all files with optional filtering"""
    
    query = db.query(File)
    
    if status:
        query = query.filter(File.status == status)
    
    total = query.count()
    files = query.offset(skip).limit(limit).all()
    
    return FileList(files=files, total=total)

@router.get("/{file_id}/progress", response_model=FileProgress)
def get_file_progress(file_id: str, db: Session = Depends(get_db)):
    """Get file processing progress"""
    
    file_record = db.query(File).filter(File.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileProgress(
        file_id=file_record.id,
        status=file_record.status,
        progress=file_record.progress,
        error_message=file_record.error_message
    )

@router.get("/{file_id}", response_model=FileContent)
def get_file_content(file_id: str, db: Session = Depends(get_db)):
    """Get file content (only available when processing is complete)"""
    
    file_record = db.query(File).filter(File.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    if file_record.status == FileStatus.processing:
        raise HTTPException(
            status_code=202, 
            detail="File is still being processed. Check progress endpoint."
        )
    elif file_record.status == FileStatus.failed:
        raise HTTPException(
            status_code=422, 
            detail=f"File processing failed: {file_record.error_message}"
        )
    elif file_record.status != FileStatus.ready:
        raise HTTPException(
            status_code=400, 
            detail="File is not ready for download"
        )
    
    return FileContent(
        file_id=file_record.id,
        filename=file_record.filename,
        status=file_record.status,
        parsed_content=file_record.parsed_content,
        created_at=file_record.created_at
    )

@router.delete("/{file_id}")
def delete_file(file_id: str, db: Session = Depends(get_db)):
    """Delete a file and its data"""
    
    file_record = db.query(File).filter(File.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Delete file from filesystem if it exists
    file_path = os.path.join(UPLOAD_DIR, f"{file_record.id}_{file_record.filename}")
    if os.path.exists(file_path):
        os.remove(file_path)
    
    # Delete from database
    db.delete(file_record)
    db.commit()
    
    return {"message": "File deleted successfully"}

@router.get("/{file_id}/download")
def download_file(file_id: str, db: Session = Depends(get_db)):
    """Download original file"""
    
    file_record = db.query(File).filter(File.id == file_id).first()
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_path = os.path.join(UPLOAD_DIR, f"{file_record.id}_{file_record.filename}")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    from fastapi.responses import FileResponse
    return FileResponse(
        path=file_path,
        filename=file_record.original_filename,
        media_type=file_record.file_type
    )
