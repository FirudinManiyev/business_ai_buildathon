from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Float, DateTime, JSON, func
from .base import Base


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    company_name: Mapped[str] = mapped_column(String(150), nullable=True)
    required_skills: Mapped[object] = mapped_column(JSON, nullable=True)
    experience_years: Mapped[str] = mapped_column(String(20), nullable=True)
    salary_min: Mapped[float] = mapped_column(Float, nullable=True)
    salary_max: Mapped[float] = mapped_column(Float, nullable=True)
    location: Mapped[str] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<Job(id={self.id}, title='{self.title}', company_name='{self.company_name}')>"
