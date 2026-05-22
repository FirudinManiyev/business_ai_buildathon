import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .models.base import Base

# Import models to ensure they are registered with the Base metadata
from .models import user, product, order, job, cv  # noqa: F401
from .models import application  # noqa: F401
from .models.job import Job
from .models.product import Product
from .models.user import User
try:
    from .utils.mock_data import JOB_LISTINGS, PRODUCTS as MOCK_PRODUCTS
except Exception:
    try:
        from utils.mock_data import JOB_LISTINGS, PRODUCTS as MOCK_PRODUCTS
    except Exception:
        JOB_LISTINGS = {}
        MOCK_PRODUCTS = {}


DB_FILENAME = "database.db"
DB_PATH = os.path.join(os.path.dirname(__file__), DB_FILENAME)
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def _ensure_users_schema() -> None:
    with engine.begin() as connection:
        columns = connection.exec_driver_sql("PRAGMA table_info(users)").all()
        column_names = {column[1] for column in columns}
        if "purchases" not in column_names:
            connection.exec_driver_sql("ALTER TABLE users ADD COLUMN purchases JSON DEFAULT '[]'")


def init_db():
    """Create the SQLite DB file and all tables defined on Base metadata."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    Base.metadata.create_all(bind=engine)
    _ensure_users_schema()
    # Seed mock data for jobs and products if tables are empty
    from sqlalchemy import select
    session = SessionLocal()
    try:
        jobs_count = session.execute(select(Job)).scalars().first()
        # If no jobs exist, insert mock job listings
        if not session.query(Job).first():
            objs = []
            for k, v in (JOB_LISTINGS or {}).items():
                objs.append(Job(
                    title=v.get('title'),
                    company_name=v.get('company_name'),
                    required_skills=v.get('required_skills'),
                    experience_years=v.get('experience_years'),
                    salary_min=v.get('salary_min'),
                    salary_max=v.get('salary_max'),
                    location=v.get('location'),
                ))
            if objs:
                session.add_all(objs)
                session.commit()

        # Seed products if none
        if not session.query(Product).first():
            prod_objs = []
            for p in (MOCK_PRODUCTS or {}).values():
                prod_objs.append(Product(
                    id=p.get('id'),
                    name=p.get('name'),
                    category=p.get('category') or 'uncategorized',
                    description=p.get('description') or '',
                    cost_price=p.get('cost_price') or 0,
                    sell_price=p.get('sell_price') or 0,
                    stock=p.get('stock') or 0,
                ))
            if prod_objs:
                session.add_all(prod_objs)
                session.commit()

        if not session.query(User).first():
            session.add_all([
                User(full_name="Admin", email="admin@biznesbayt.az", password_hash="admin123", purpose="admin", purchases=[]),
                User(full_name="Test İstifadəçi", email="user@test.az", password_hash="user123", purpose="user", purchases=[]),
            ])
            session.commit()
    finally:
        session.close()


if __name__ == "__main__":
    init_db()
    print(f"Initialized SQLite DB at {DB_PATH}")
