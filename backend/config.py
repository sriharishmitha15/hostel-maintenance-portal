import os
import socket
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

def check_mysql_live(host, port):
    """Checks if the MySQL port is actually accepting connections."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.6)
        res = s.connect_ex((host if host != "localhost" else "127.0.0.1", int(port)))
        s.close()
        return res == 0
    except Exception:
        return False

class Config:
    """Base application configuration."""
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-hostel-maintenance-2026")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-key-hostel-2026")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        hours=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_HOURS", 24))
    )

    # MySQL Configuration variables
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_NAME = os.getenv("DB_NAME", "hostel_maintenance_db")

    DEFAULT_MYSQL_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    EXPLICIT_DB_URL = os.getenv("DATABASE_URL")
    FORCE_SQLITE = os.getenv("USE_SQLITE", "false").lower() == "true"

    # Intelligent DB Selection:
    # 1. If USE_SQLITE=true is forced, use SQLite.
    # 2. Otherwise check if MySQL is listening on DB_HOST:DB_PORT.
    # 3. If MySQL is unreachable, fall back to SQLite to prevent 500 crashes.
    if FORCE_SQLITE:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'hostel_maintenance.db')}"
        DB_DRIVER = "sqlite"
    elif check_mysql_live(DB_HOST, DB_PORT):
        SQLALCHEMY_DATABASE_URI = EXPLICIT_DB_URL or DEFAULT_MYSQL_URL
        DB_DRIVER = "mysql"
    else:
        # Fallback to local SQLite file
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'hostel_maintenance.db')}"
        DB_DRIVER = "sqlite_fallback"

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_recycle": 280,
        "pool_pre_ping": True,
    }

    # Uploads Configuration
    UPLOAD_FOLDER = os.path.join(BASE_DIR, os.getenv("UPLOAD_FOLDER", "uploads"))
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 5 * 1024 * 1024))
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
