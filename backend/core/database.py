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
    import os
    persistent_dir = "/home" if os.path.exists("/home") else "."
    sqlite_url = f"sqlite:///{persistent_dir}/leadforge.db"
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

# Ensure all SQLAlchemy ORM models are registered and create tables if missing
try:
    import models
    from models.base import Base
    Base.metadata.create_all(bind=engine)
except Exception as table_err:
    print(f"Database table creation note: {table_err}")

# Auto-migrate new schema columns if missing
_auto_migrate_columns = [
    ("companies", "location", "VARCHAR"),
    ("companies", "address", "VARCHAR"),
]

try:
    from sqlalchemy import text, inspect

    with engine.connect() as conn:
        inspector = inspect(engine)
        for table_name, col_name, col_type in _auto_migrate_columns:
            try:
                existing_tables = inspector.get_table_names()
                if table_name not in existing_tables:
                    continue
                existing_cols = [c["name"] for c in inspector.get_columns(table_name)]
                if col_name not in existing_cols:
                    conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_type}"))
                    conn.commit()
            except Exception as col_err:
                print(f"Auto-migration note ({table_name}.{col_name}): {col_err}")
except Exception as e:
                print(f"Auto-migration note: {e}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
