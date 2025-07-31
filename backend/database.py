from fastapi import Request
from motor.motor_asyncio import AsyncIOMotorDatabase


def get_database(request: Request) -> AsyncIOMotorDatabase:
    return request.app.mongodb


async def create_indexes(db: AsyncIOMotorDatabase):
    await db.resumes.create_index([("user_id", 1), ("created_at", -1)])
    await db.applications.create_index([("user_id", 1), ("created_at", -1)])
    await db.applications.create_index([("user_id", 1), ("status", 1)])
    await db.applications.create_index([("user_id", 1), ("company_name", 1)])
    await db.cover_letters.create_index([("user_id", 1), ("created_at", -1)])
    await db.users.create_index([("email", 1)], unique=True)
