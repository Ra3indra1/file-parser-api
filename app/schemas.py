from pydantic import BaseModel
from typing import Optional, Any, List
from datetime import datetime
from app.models import FileStatus

class FileBase(BaseModel):
    filename: str
    original_filename: str
    file_size: Optional[int] = None
    file_type: Optional[str] = None

class FileCreate(FileBase):
    pass

class FileResponse(FileBase):
    id: str
    status: FileStatus
    progress: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class FileProgress(BaseModel):
    file_id: str
    status: FileStatus
    progress: int
    error_message: Optional[str] = None

class FileContent(BaseModel):
    file_id: str
    filename: str
    status: FileStatus
    parsed_content: Optional[Any] = None
    created_at: datetime

class FileList(BaseModel):
    files: List[FileResponse]
    total: int
