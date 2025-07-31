from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any

from pydantic import BaseModel, Field


class ApplicationStatus(str, Enum):
    APPLIED = "applied"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    INTERVIEW_COMPLETED = "interview_completed"
    OFFER = "offer"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class CoverLetterTone(str, Enum):
    FORMAL = "formal"
    CONFIDENT = "confident"
    FRIENDLY = "friendly"
    PROFESSIONAL = "professional"


class ResumeResponse(BaseModel):
    id: str = Field(alias="_id")
    filename: str
    content: str
    created_at: datetime


class OptimizationRequest(BaseModel):
    resume_id: str
    job_description: str


class OptimizationResult(BaseModel):
    missing_keywords: List[str]
    skill_gaps: List[str]
    suggestions: List[str]
    improved_content: Optional[str] = None
    match_percentage: float


class ATSResult(BaseModel):
    score: int
    feedback: List[str]
    keyword_matches: Dict[str, List[str]]
    formatting_issues: List[str]
    recommendations: List[str]


class AnalyzeResumeResponse(BaseModel):
    optimization: OptimizationResult
    ats: ATSResult


class CoverLetterRequest(BaseModel):
    job_description: str
    company_name: str
    position_title: str
    resume_id: Optional[str] = None
    tone: CoverLetterTone = CoverLetterTone.PROFESSIONAL


class CoverLetterResponse(BaseModel):
    resume_id: str
    company_name: str
    position_title: str
    content: str
    tone: str
    created_at: datetime


class ApplicationRequest(BaseModel):
    company_name: str
    position_title: str
    job_description: Optional[str] = None
    application_url: Optional[str] = None
    resume_id: Optional[str] = None
    cover_letter_id: Optional[str] = None
    status: ApplicationStatus = ApplicationStatus.APPLIED
    notes: Optional[str] = None
    salary_range: Optional[str] = None
    location: Optional[str] = None
    application_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None


class ApplicationUpdateRequest(BaseModel):
    company_name: Optional[str] = None
    position_title: Optional[str] = None
    job_description: Optional[str] = None
    application_url: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    notes: Optional[str] = None
    salary_range: Optional[str] = None
    location: Optional[str] = None
    interview_date: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None


class ApplicationResponse(BaseModel):
    id: str = Field(alias="_id")
    company_name: str
    position_title: str
    job_description: Optional[str]
    application_url: Optional[str]
    resume_id: Optional[str]
    cover_letter_id: Optional[str]
    status: str
    notes: Optional[str]
    salary_range: Optional[str]
    location: Optional[str]
    application_date: Optional[datetime]
    interview_date: Optional[datetime]
    follow_up_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class StatusCount(BaseModel):
    status: str
    count: int


class DashboardResponse(BaseModel):
    total_applications: int
    status_breakdown: List[StatusCount]
    recent_applications: List[ApplicationResponse]
    avg_response_time: Optional[float] = None
    interview_rate: float
    success_metrics: Dict[str, Any]
