Steps to Build the File Parser CRUD API with Progress Tracking
1. Decide Your Stack
To stay pragmatic (fast + modern + interview-friendly):

Backend Framework: FastAPI (Python) → async-friendly, easy file uploads, native docs (Swagger).

Database: PostgreSQL (or SQLite if local dev only).

ORM: SQLAlchemy (+ Alembic migrations).

Async Tasks: Celery + Redis (for progress tracking & background parsing).

Auth (bonus): JWT with fastapi-jwt-auth or pyjwt.

2. Set Up the Project Structure
bash
Copy
Edit
mkdir file-parser-api && cd file-parser-api
python -m venv venv && source venv/bin/activate
pip install fastapi uvicorn sqlalchemy psycopg2-binary alembic celery redis pandas
Project tree (initially):

bash
Copy
Edit
file-parser-api/
 ├── app/
 │   ├── main.py          # FastAPI entrypoint
 │   ├── models.py        # SQLAlchemy models
 │   ├── database.py      # DB session setup
 │   ├── schemas.py       # Pydantic schemas
 │   ├── routes/
 │   │   ├── files.py     # File CRUD endpoints
 │   ├── workers.py       # Celery worker & tasks
 │   └── utils.py         # Helpers (progress tracking, file parsing)
 ├── migrations/          # Alembic
 ├── requirements.txt
 └── README.md
3. Define the Database Model
models.py

python
Copy
Edit
from sqlalchemy import Column, String, Integer, DateTime, Enum, JSON
from sqlalchemy.ext.declarative import declarative_base
import enum, uuid, datetime

Base = declarative_base()

class FileStatus(str, enum.Enum):
    uploading = "uploading"
    processing = "processing"
    ready = "ready"
    failed = "failed"

class File(Base):
    __tablename__ = "files"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False)
    status = Column(Enum(FileStatus), default=FileStatus.uploading)
    progress = Column(Integer, default=0)
    parsed_content = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
4. File Upload API (POST /files)
Accept multipart upload.

Save file metadata → DB row with status="uploading".

Write file temporarily to disk or S3 bucket.

Spawn Celery task to parse file.

routes/files.py (simplified):

python
Copy
Edit
@router.post("/files")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    db_file = File(filename=file.filename)
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    # Save to disk
    temp_path = f"/tmp/{db_file.id}_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())

    # Trigger Celery task
    parse_file_task.delay(db_file.id, temp_path)

    return {"file_id": db_file.id, "status": db_file.status}
5. Background Worker (Celery)
workers.py

python
Copy
Edit
from celery import Celery
from .database import SessionLocal
from .models import File, FileStatus
import pandas as pd, time, json

celery = Celery(__name__, broker="redis://localhost:6379/0")

@celery.task
def parse_file_task(file_id: str, file_path: str):
    db = SessionLocal()
    file = db.query(File).filter(File.id == file_id).first()
    try:
        file.status = FileStatus.processing
        db.commit()

        # Simulate long processing with progress updates
        for i in range(1, 11):
            time.sleep(1)  # fake heavy parsing
            file.progress = i * 10
            db.commit()

        # Example: parse CSV into JSON
        df = pd.read_csv(file_path)
        file.parsed_content = df.to_dict(orient="records")
        file.status = FileStatus.ready
        file.progress = 100
        db.commit()

    except Exception as e:
        file.status = FileStatus.failed
        db.commit()
    finally:
        db.close()
6. Progress API (GET /files/{id}/progress)
Return DB fields.

python
Copy
Edit
@router.get("/files/{file_id}/progress")
def get_progress(file_id: str, db: Session = Depends(get_db)):
    file = db.query(File).filter(File.id == file_id).first()
    return {"file_id": file.id, "status": file.status, "progress": file.progress}
7. Get File Content API (GET /files/{id})
python
Copy
Edit
@router.get("/files/{file_id}")
def get_file(file_id: str, db: Session = Depends(get_db)):
    file = db.query(File).filter(File.id == file_id).first()
    if file.status != "ready":
        return {"message": "File upload or processing in progress. Please try again later."}
    return {"file_id": file.id, "content": file.parsed_content}
8. CRUD
List Files (GET /files): return all metadata.

Delete File (DELETE /files/{id}): delete row + parsed content.

9. Extra Enhancements
WebSocket/SSE: push progress updates instead of polling.

JWT Auth: wrap endpoints with Depends(get_current_user).

Unit Tests: use pytest + httpx for async endpoint testing.

10. README + Postman
README should contain:

How to run FastAPI (uvicorn app.main:app --reload)

How to run Celery (celery -A app.workers.celery worker --loglevel=info)

Example curl commands or Postman collection.

📌 Execution Checklist
Scaffold FastAPI app.

Set up DB + migrations.

Create File model.

Implement file upload route.

Set up Celery + Redis worker.

Implement parsing logic + progress updates.

Implement progress API.

Implement content retrieval API.

Add CRUD (list/delete).

Polish README + Postman collection.
