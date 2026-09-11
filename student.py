from fastapi import FastAPI
from supabase import create_client
from dotenv import load_dotenv
import os

# Load variables from .env
load_dotenv()

# Create FastAPI application
app = FastAPI()

# Get Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Connect Python to Supabase
supabase = create_client(
SUPABASE_URL,
SUPABASE_KEY
)
The important part is:
supabase = create_client(
SUPABASE_URL,
SUPABASE_KEY
)
