from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
from dotenv import load_dotenv
from pydantic import BaseModel
import os


# ============================================================
# 1. LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


# ============================================================
# 2. CREATE FASTAPI APPLICATION
# ============================================================

app = FastAPI()


# ============================================================
# 3. CORS - ALLOW FRONTEND
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# 4. GET SUPABASE CREDENTIALS
# ============================================================

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


# ============================================================
# 5. CONNECT TO SUPABASE
# ============================================================

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


# ============================================================
# 6. STUDENT MODEL
# ============================================================

class Student(BaseModel):
    name: str
    course: str
    marks: int


# ============================================================
# 7. HOME / TEST API
# ============================================================

@app.get("/")
def home():
    return {
        "message": "FastAPI and Supabase connected successfully"
    }


# ============================================================
# 8. CREATE STUDENT
# ============================================================

@app.post("/students")
def create_student(student: Student):

    try:

        data = {
            "name": student.name,
            "course": student.course,
            "marks": student.marks
        }

        response = (
            supabase
            .table("students")
            .insert(data)
            .execute()
        )

        return {
            "message": "Student created successfully",
            "data": response.data
        }

    except Exception as e:

        print("CREATE ERROR:", e)

        return {
            "message": "Student creation failed",
            "error": str(e)
        }


# ============================================================
# 9. GET ALL STUDENTS
# ============================================================

@app.get("/students")
def get_students():

    try:

        response = (
            supabase
            .table("students")
            .select("*")
            .execute()
        )

        return response.data

    except Exception as e:

        print("GET ERROR:", e)

        return {
            "message": "Failed to get students",
            "error": str(e)
        }


# ============================================================
# 10. UPDATE STUDENT
# ============================================================

@app.put("/students/{student_id}")
def update_student(student_id: int, student: Student):

    try:

        data = {
            "name": student.name,
            "course": student.course,
            "marks": student.marks
        }

        response = (
            supabase
            .table("students")
            .update(data)
            .eq("id", student_id)
            .execute()
        )

        return {
            "message": "Student updated successfully",
            "data": response.data
        }

    except Exception as e:

        print("UPDATE ERROR:", e)

        return {
            "message": "Student update failed",
            "error": str(e)
        }


# ============================================================
# 11. DELETE STUDENT
# ============================================================

@app.delete("/students/{student_id}")
def delete_student(student_id: int):

    try:

        response = (
            supabase
            .table("students")
            .delete()
            .eq("id", student_id)
            .execute()
        )

        return {
            "message": "Student deleted successfully",
            "data": response.data
        }

    except Exception as e:

        print("DELETE ERROR:", e)

        return {
            "message": "Student deletion failed",
            "error": str(e)
        }