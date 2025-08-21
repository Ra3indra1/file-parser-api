# File Parser CRUD API

A REST API for uploading, parsing, and managing files with real-time progress tracking.  
Built with **FastAPI**, **SQLAlchemy**, **Celery**, and **Redis**.

---

## 🚀 Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd file-parser-api
```

### 2. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Start Redis (required for Celery)
```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### 5. Initialize database
```bash
alembic upgrade head
```

### 6. Start FastAPI server
```bash
uvicorn app.main:app --reload
```

### 7. Start Celery worker
```bash
celery -A app.workers.celery_app worker --loglevel=info
```

- API Docs: http://localhost:8000/docs  
- Alternative docs: http://localhost:8000/redoc  
- Health check: http://localhost:8000/health  

---

## 📌 API Documentation & Examples

### 1. Upload a File
**POST** `/api/v1/files/`

**Request (curl):**
```bash
curl -X POST "http://localhost:8000/api/v1/files/" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@example.csv"
```

**Response:**
```json
{
  "file_id": "3d1a73d2-34c7-4e41-91e1-f8c6b5e4e1c2",
  "status": "uploading"
}
```

---

### 2. Check Progress
**GET** `/api/v1/files/{file_id}/progress`

**Response (processing):**
```json
{
  "file_id": "3d1a73d2-34c7-4e41-91e1-f8c6b5e4e1c2",
  "status": "processing",
  "progress": 60
}
```

**Response (done):**
```json
{
  "file_id": "3d1a73d2-34c7-4e41-91e1-f8c6b5e4e1c2",
  "status": "ready",
  "progress": 100
}
```

---

### 3. Get Parsed Content
**GET** `/api/v1/files/{file_id}`

**Response (ready):**
```json
{
  "file_id": "3d1a73d2-34c7-4e41-91e1-f8c6b5e4e1c2",
  "content": [
    {"name": "Alice", "age": 30},
    {"name": "Bob", "age": 25}
  ]
}
```

**Response (still processing):**
```json
{
  "message": "File upload or processing in progress. Please try again later."
}
```

---

### 4. List Files
**GET** `/api/v1/files/`

**Response:**
```json
[
  {
    "id": "3d1a73d2-34c7-4e41-91e1-f8c6b5e4e1c2",
    "filename": "example.csv",
    "status": "ready",
    "created_at": "2025-08-21T12:34:56Z"
  }
]
```

---

### 5. Delete File
**DELETE** `/api/v1/files/{file_id}`

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

---

## 📂 Project Structure
```
file-parser-api/
├── app/
│   ├── main.py              # FastAPI application
│   ├── database.py          # DB config
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── utils.py             # Parsing helpers
│   ├── workers.py           # Celery tasks
│   └── routes/
│       └── files.py         # File endpoints
├── migrations/              # Alembic migrations
├── uploads/                 # File storage
├── requirements.txt
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## 🛠 Supported File Types
- **CSV** → Parsed into structured JSON  
- **JSON** → Validated & returned  
- **TXT** → Line & character counts  

---

## 🧪 Testing
```bash
pytest
```

---

## 📦 Postman Collection
A ready-to-use Postman collection is included:  
👉 [postman_collection.json](postman_collection.json)

Import into Postman and test all endpoints.  

---

## 📜 License
MIT License – see LICENSE file.
