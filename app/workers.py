from celery import Celery
from app.database import SessionLocal
from app.models import File, FileStatus
from app.utils import parse_file_by_type
import time
import os

# Celery configuration
celery_app = Celery(
    "file_parser",
    broker=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    backend=os.getenv("REDIS_URL", "redis://localhost:6379/0")
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task(bind=True)
def parse_file_task(self, file_id: str, file_path: str, file_type: str):
    """Background task to parse uploaded file"""
    db = SessionLocal()
    
    try:
        # Get file record
        file_record = db.query(File).filter(File.id == file_id).first()
        if not file_record:
            raise Exception("File record not found")
        
        # Update status to processing
        file_record.status = FileStatus.processing
        file_record.progress = 0
        db.commit()
        
        # Simulate processing with progress updates
        for i in range(1, 6):
            time.sleep(1)  # Simulate processing time
            file_record.progress = i * 20
            db.commit()
            
            # Update task progress
            self.update_state(
                state="PROGRESS",
                meta={"current": i * 20, "total": 100, "status": "Processing..."}
            )
        
        # Parse the file
        try:
            parsed_content = parse_file_by_type(file_path, file_type)
            file_record.parsed_content = parsed_content
            file_record.status = FileStatus.ready
            file_record.progress = 100
            file_record.error_message = None
        except Exception as parse_error:
            file_record.status = FileStatus.failed
            file_record.error_message = str(parse_error)
            file_record.progress = 0
            raise parse_error
        
        db.commit()
        
        # Clean up temporary file
        if os.path.exists(file_path):
            os.remove(file_path)
            
        return {"status": "completed", "file_id": file_id}
        
    except Exception as e:
        # Update file status to failed
        if 'file_record' in locals():
            file_record.status = FileStatus.failed
            file_record.error_message = str(e)
            db.commit()
        
        # Clean up temporary file
        if os.path.exists(file_path):
            os.remove(file_path)
            
        raise e
    finally:
        db.close()
