import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .models.base import Base

# Import models to ensure they are registered with the Base metadata
from .models import user, product, order, job, cv  # noqa: F401


DB_FILENAME = "database.db"
DB_PATH = os.path.join(os.path.dirname(__file__), DB_FILENAME)
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def init_db():
    """Create the SQLite DB file and all tables defined on Base metadata."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print(f"Initialized SQLite DB at {DB_PATH}")
