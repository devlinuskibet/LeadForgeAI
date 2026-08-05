from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .config import settings

import os

db_url = settings.DATABASE_URL

# Force persistent directory on Azure App Service (/home is persistent SMB volume across restarts)
if os.path.exists("/home") and ("sqlite" in db_url or "postgresql" in db_url):
    # Fall back to persistent SQLite if postgresql is local/unreachable
    if "postgresql" in db_url:
        try:
            test_engine = create_engine(db_url)
            with test_engine.connect() as conn: pass
        except Exception:
            db_url = "sqlite:////home/leadforge.db"
    else:
        db_url = "sqlite:////home/leadforge.db"

try:
    if "sqlite" in db_url:
        engine = create_engine(db_url, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(db_url)
    with engine.connect() as conn:
        pass
except Exception:
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
    ("email_messages", "delivered_at", "TIMESTAMP WITH TIME ZONE"),
    ("email_messages", "opened_count", "INTEGER DEFAULT 0"),
    ("deals", "probability", "FLOAT DEFAULT 75.0"),
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

        try:
            if "email_messages" in inspector.get_table_names():
                conn.execute(text("UPDATE email_messages SET sender = 'leadforge1.ai@gmail.com' WHERE sender LIKE '%copilot@leadforge%' OR sender LIKE '%noreply@leadforge%'"))
                conn.commit()
        except Exception as update_err:
            print(f"Sender update note: {update_err}")

        try:
            from services.email_provider import save_smtp_config, load_smtp_config
            if not load_smtp_config().get("SMTP_PASSWORD"):
                save_smtp_config(
                    host="smtp.gmail.com",
                    port=587,
                    user="leadforge1.ai@gmail.com",
                    password="takrfowpydnnvbiy"
                )
        except Exception as smtp_init_err:
            print(f"SMTP init note: {smtp_init_err}")
except Exception as e:
                print(f"Auto-migration note: {e}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
