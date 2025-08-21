# File Parser CRUD API

A REST API for uploading, parsing, and managing files with real-time progress tracking. Built with FastAPI, SQLAlchemy, Celery, and Redis.

## Features

-  File Upload**: Upload CSV, JSON, and text files
-  Background Processing**: Asynchronous file parsing with Celery
-  Progress Tracking**: Real-time progress updates during processing
- ️ CRUD Operations**: Create, read, update, delete files
-  File Listing**: List files with filtering and pagination
-  Fast API**: Auto-generated OpenAPI documentation
-  Docker Support**: Easy deployment with Docker Compose

## Quick Start

### Local Development

1. **Clone the repository**
\`\`\`bash
git clone <your-repo-url>
cd file-parser-api
\`\`\`

2. **Create virtual environment**
\`\`\`bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
\`\`\`

3. **Install dependencies**
\`\`\`bash
pip install -r requirements.txt
\`\`\`

4. **Start Redis (required for Celery)**
\`\`\`bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or install Redis locally
# macOS: brew install redis && brew services start redis
# Ubuntu: sudo apt install redis-server && sudo systemctl start redis
\`\`\`

5. **Initialize database**
\`\`\`bash
alembic upgrade head
\`\`\`

6. **Start the FastAPI server**
\`\`\`bash
uvicorn app.main:app --reload
\`\`\`

7. **Start Celery worker (in another terminal)**
\`\`\`bash
celery -A app.workers.celery_app worker --loglevel=info
\`\`\`

8. **Access the API**
- API Documentation: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc
- Health check: http://localhost:8000/health

### Docker Deployment

1. **Start all services**
\`\`\`bash
docker-compose up -d
\`\`\`

2. **Run database migrations**
\`\`\`bash
docker-compose exec web alembic upgrade head
\`\`\`

3. **Access the API at http://localhost:8000**

## API Endpoints

### File Operations

- `POST /api/v1/files/` - Upload a file
- `GET /api/v1/files/` - List all files (with pagination)
- `GET /api/v1/files/{file_id}` - Get file content
- `GET /api/v1/files/{file_id}/progress` - Get processing progress
- `GET /api/v1/files/{file_id}/download` - Download original file
- `DELETE /api/v1/files/{file_id}` - Delete a file

### Example Usage

**Upload a file:**
\`\`\`bash
curl -X POST "http://localhost:8000/api/v1/files/" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@example.csv"
\`\`\`

**Check progress:**
\`\`\`bash
curl "http://localhost:8000/api/v1/files/{file_id}/progress"
\`\`\`

**Get parsed content:**
\`\`\`bash
curl "http://localhost:8000/api/v1/files/{file_id}"
\`\`\`

## Supported File Types

- **CSV files** (.csv) - Parsed into structured JSON with rows and columns
- **JSON files** (.json) - Validated and returned as structured data
- **Text files** (.txt) - Content analysis with character and line counts

## Environment Variables

- `DATABASE_URL` - Database connection string (default: SQLite)
- `REDIS_URL` - Redis connection string (default: redis://localhost:6379/0)
- `PORT` - Server port (default: 8000)

## Project Structure

\`\`\`
file-parser-api/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── utils.py             # Utility functions
│   ├── workers.py           # Celery tasks
│   └── routes/
│       ├── __init__.py
│       └── files.py         # File endpoints
├── migrations/              # Alembic migrations
├── uploads/                 # File storage directory
├── requirements.txt
├── docker-compose.yml
├── Dockerfile
└── README.md
\`\`\`

## Development

### Running Tests
\`\`\`bash
pytest
\`\`\`

### Database Migrations
\`\`\`bash
# Create a new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head
\`\`\`

### Adding New File Types

1. Add parsing logic in `app/utils.py`
2. Update the `parse_file_by_type` function
3. Test with sample files

## Production Deployment

### Environment Setup
- Use PostgreSQL instead of SQLite
- Configure Redis with persistence
- Set up proper CORS origins
- Use environment variables for secrets
- Enable logging and monitoring

### Scaling
- Run multiple Celery workers
- Use Redis Cluster for high availability
- Implement file storage with cloud services (S3, etc.)
- Add rate limiting and authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
