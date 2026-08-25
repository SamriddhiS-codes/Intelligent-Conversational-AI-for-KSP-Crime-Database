from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .config import get_settings
from .database import test_connection, engine, Base
from .routes import auth, query, analytics, export
from .services.sql_service import get_schema_summary
from .database import SessionLocal

# Import models so SQLAlchemy creates the tables
from .models import user, crime  # noqa

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    description="Intelligent Conversational AI for Karnataka State Police Crime Database",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f">>> {request.method} {request.url.path}")
    response = await call_next(request)
    return response

# CORS: only needed for LOCAL development.
# In production on Catalyst, ZGS gateway injects Access-Control-Allow-Origin itself —
# adding this middleware there too causes duplicate headers, which browsers reject.
# Set RUN_ENV=local in your local .env to enable this.
if settings.RUN_ENV == "local":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Register all routers
app.include_router(auth.router)
app.include_router(query.router)
app.include_router(analytics.router)
app.include_router(export.router)


@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables ready")
    if test_connection():
        print("✅ PostgreSQL connected")
    else:
        print("❌ PostgreSQL connection failed — check .env")

@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.APP_NAME,
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health", tags=["Health"])
def health():
    db_ok = test_connection()
    return {"status": "ok" if db_ok else "degraded", "database": db_ok}

@app.get("/stats", tags=["Health"])
def stats():
    db = SessionLocal()
    try:
        return get_schema_summary(db)
    finally:
        db.close()