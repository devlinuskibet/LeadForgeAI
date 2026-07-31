from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .config import settings

db_url = settings.DATABASE_URL

try:
    if "sqlite" in db_url:
        engine = create_engine(db_url, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(db_url)
    with engine.connect() as conn:
        pass
except Exception:
    sqlite_url = "sqlite:///./leadforge.db"
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

# Auto-migrate new schema columns if missing
try:
    from sqlalchemy import text
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS location VARCHAR;"))
        conn.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS address VARCHAR;"))
except Exception as e:
    print(f"Auto-migration note: {e}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
