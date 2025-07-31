import io
from datetime import datetime, timedelta
from typing import Optional

import pandas as pd
from fastapi.responses import StreamingResponse
from models import StatusCount, ApplicationResponse
from motor.motor_asyncio import AsyncIOMotorDatabase


class ApplicationService:
    async def get_analytics(self, db: AsyncIOMotorDatabase) -> dict:
        applications = []
        async for app in db.applications.find({}):
            app["_id"] = str(app["_id"])
            applications.append(app)

        total_applications = len(applications)

        if total_applications == 0:
            return {"total_applications": 0, "status_breakdown": [], "recent_applications": [], "interview_rate": 0.0,
                    "success_metrics": {}}

        status_counts = {}
        for app in applications:
            status = app.get("status", "applied")
            status_counts[status] = status_counts.get(status, 0) + 1

        status_breakdown = [StatusCount(status=status, count=count) for status, count in status_counts.items()]

        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_applications = [ApplicationResponse(**app) for app in applications if
                               app.get("created_at", datetime.min) > thirty_days_ago]
        recent_applications.sort(key=lambda x: x.created_at, reverse=True)
        recent_applications = recent_applications[:10]

        interview_statuses = {"interview_scheduled", "interview_completed", "offer"}
        interview_count = sum(1 for app in applications if app.get("status") in interview_statuses)
        interview_rate = (interview_count / total_applications) * 100

        offers_count = status_counts.get("offer", 0)
        rejections_count = status_counts.get("rejected", 0)

        success_metrics = {"offer_rate": (offers_count / total_applications) * 100,
                           "rejection_rate": (rejections_count / total_applications) * 100,
                           "pending_applications": status_counts.get("applied", 0), "total_interviews": interview_count,
                           "applications_this_month": sum(
                               1 for app in applications if app.get("created_at", datetime.min) > thirty_days_ago)}

        return {"total_applications": total_applications, "status_breakdown": status_breakdown,
                "recent_applications": recent_applications, "interview_rate": interview_rate,
                "success_metrics": success_metrics}

    async def export_applications_to_excel(self, db, status: Optional[str] = None):
        query = {}
        if status:
            query["status"] = status

        applications = []
        async for app in db.applications.find(query):
            filtered_app = {"Position": app.get("position_title") or "", "Status": app.get("status") or "",
                            "Application Date": app.get("application_date").strftime("%Y-%m-%d") if isinstance(
                                app.get("application_date"), datetime) else (app.get("application_date") or ""),
                            "Interview Date": app.get("interview_date").strftime("%Y-%m-%d") if isinstance(
                                app.get("interview_date"), datetime) else (app.get("interview_date") or ""),
                            "Description": app.get("job_description") or "", }
            applications.append(filtered_app)

        if not applications:
            return StreamingResponse(io.BytesIO(b"No applications found."), media_type="text/plain",
                                     headers={"Content-Disposition": "attachment; filename=empty.txt"})

        df = pd.DataFrame(applications)

        output = io.BytesIO()
        with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
            df.to_excel(writer, index=False, sheet_name="Applications")
        output.seek(0)

        return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                 headers={"Content-Disposition": "attachment; filename=applications.xlsx"})
