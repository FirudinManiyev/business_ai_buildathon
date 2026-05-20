from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, DateTime, JSON, ForeignKey, func
from .base import Base


class CV(Base):
    __tablename__ = "cvs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=True)
    education: Mapped[str] = mapped_column(String(500), nullable=True)
    experience: Mapped[str] = mapped_column(String(1000), nullable=True)
    skills: Mapped[object] = mapped_column(JSON, nullable=True)
    projects: Mapped[str] = mapped_column(String(2000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationship back to user
    user = relationship("User", back_populates="cv")

    def __repr__(self):
        return f"<CV(id={self.id}, user_id={self.user_id}, full_name='{self.full_name}')>"
