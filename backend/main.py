import os
from datetime import datetime
from typing import List, Optional

from bson import ObjectId
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from database import get_database
from models import (ResumeResponse, AnalyzeResumeResponse, OptimizationRequest, CoverLetterResponse, CoverLetterRequest,
                    ApplicationResponse, ApplicationRequest, ApplicationUpdateRequest, DashboardResponse, )
from services.ai_service import AIService
from services.application_service import ApplicationService
from services.resume_service import ResumeService

load_dotenv()

app = FastAPI(title="AuraHire API", version="1.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_credentials=True, allow_methods=["*"],
                   allow_headers=["*"], )

ai_service = AIService()
resume_service = ResumeService()
application_service = ApplicationService()


@app.on_event("startup")
async def startup_event():
    mongodb_url = os.getenv("MONGO_URI")
    database_name = os.getenv("DATABASE_NAME")
    if not mongodb_url or not database_name:
        raise RuntimeError("MONGO_URI or DATABASE_NAME not set in .env")
    app.mongodb_client = AsyncIOMotorClient(mongodb_url)
    app.mongodb = app.mongodb_client[database_name]


@app.on_event("shutdown")
async def shutdown_event():
    app.mongodb_client.close()


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}


@app.post("/api/resumes/upload", response_model=ResumeResponse)
async def upload_resume(file: UploadFile = File(...), db=Depends(get_database)):
    if not file.filename.endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
    content = await file.read()
    parsed_content = await resume_service.parse_resume(content, file.filename)
    resume_data = {"filename": file.filename, "content": parsed_content, "created_at": datetime.utcnow(),
                   "updated_at": datetime.utcnow(), }
    result = await db.resumes.insert_one(resume_data)
    resume_data["_id"] = str(result.inserted_id)
    return ResumeResponse(**resume_data)


@app.get("/api/resumes", response_model=List[ResumeResponse])
async def get_resumes(db=Depends(get_database)):
    resumes = []
    async for resume in db.resumes.find():
        resume["_id"] = str(resume["_id"])
        resumes.append(ResumeResponse(**resume))
    return resumes


@app.post("/api/analyze_resume", response_model=AnalyzeResumeResponse)
async def analyze_resume_for_job_no_path_id(request: OptimizationRequest, db=Depends(get_database)):
    resume_id = request.resume_id
    if not ObjectId.is_valid(resume_id):
        raise HTTPException(status_code=400, detail="Invalid resume ID format.")
    resume = await db.resumes.find_one({"_id": ObjectId(resume_id)})
    if not resume or not resume.get("content"):
        raise HTTPException(status_code=404, detail="Resume not found or content empty.")
    result = await ai_service.analyze_resume(resume_content=resume["content"],
                                             job_description=request.job_description, )
    return AnalyzeResumeResponse(**result)


@app.post("/api/cover-letters/generate", response_model=CoverLetterResponse)
async def generate_cover_letter(request: CoverLetterRequest, db=Depends(get_database)):
    if not request.resume_id or not ObjectId.is_valid(request.resume_id):
        raise HTTPException(status_code=400, detail="Valid resume ID must be provided.")
    resume = await db.resumes.find_one({"_id": ObjectId(request.resume_id)})
    if not resume or not resume.get("content"):
        raise HTTPException(status_code=404, detail="Resume not found or content empty.")
    cover_letter_content = await ai_service.generate_cover_letter(job_description=request.job_description,
                                                                  company_name=request.company_name,
                                                                  position_title=request.position_title,
                                                                  resume_content=resume["content"],
                                                                  tone=request.tone.value, )
    return CoverLetterResponse(resume_id=request.resume_id, company_name=request.company_name,
                               position_title=request.position_title, content=cover_letter_content["content"],
                               tone=request.tone.value, created_at=datetime.utcnow(), )


@app.post("/api/applications", response_model=ApplicationResponse)
async def create_application(request: ApplicationRequest, db=Depends(get_database)):
    application_data = {**request.dict(), "created_at": datetime.utcnow(), "updated_at": datetime.utcnow(), }
    result = await db.applications.insert_one(application_data)
    application_data["_id"] = str(result.inserted_id)
    return ApplicationResponse(**application_data)


@app.get("/api/applications", response_model=List[ApplicationResponse])
async def get_applications(status: Optional[str] = None, db=Depends(get_database)):
    query = {"status": status} if status else {}
    applications = []
    async for app in db.applications.find(query):
        app["_id"] = str(app["_id"])
        applications.append(ApplicationResponse(**app))
    return applications


@app.put("/api/applications/{application_id}", response_model=ApplicationResponse)
async def update_application(application_id: str, request: ApplicationUpdateRequest, db=Depends(get_database)):
    if not ObjectId.is_valid(application_id):
        raise HTTPException(status_code=400, detail="Invalid application ID format.")
    update_data = {k: v for k, v in request.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    result = await db.applications.update_one({"_id": ObjectId(application_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    app_data = await db.applications.find_one({"_id": ObjectId(application_id)})
    app_data["_id"] = str(app_data["_id"])
    return ApplicationResponse(**app_data)


@app.delete("/api/applications/{application_id}")
async def delete_application(application_id: str, db=Depends(get_database)):
    if not ObjectId.is_valid(application_id):
        raise HTTPException(status_code=400, detail="Invalid application ID format.")
    result = await db.applications.delete_one({"_id": ObjectId(application_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"message": "Application deleted successfully"}


@app.get("/api/analytics/dashboard", response_model=DashboardResponse)
async def get_dashboard_analytics(db=Depends(get_database)):
    analytics = await application_service.get_analytics(db=db)
    return DashboardResponse(**analytics)


@app.get("/api/applications/download")
async def download_applications(status: Optional[str] = None, db=Depends(get_database)):
    return await application_service.export_applications_to_excel(db=db, status=status)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000)
