from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    job_id: Mapped[int] = mapped_column(Integer, ForeignKey("jobs.id"), nullable=False)
    job_title: Mapped[str] = mapped_column(String(200), nullable=False)
    applicant_name: Mapped[str] = mapped_column(String(120), nullable=False)
    applicant_email: Mapped[str] = mapped_column(String(120), nullable=False)
    applicant_phone: Mapped[str] = mapped_column(String(50), nullable=True)
    cv_payload: Mapped[object] = mapped_column(JSON, nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="pending")
    admin_message: Mapped[str] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    job = relationship("Job")

    def __repr__(self) -> str:
        return f"<Application(id={self.id}, job_id={self.job_id}, applicant_email='{self.applicant_email}', status='{self.status}')>"