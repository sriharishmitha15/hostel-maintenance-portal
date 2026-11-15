import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

def allowed_file(filename):
    """Check if file extension is allowed."""
    allowed = current_app.config.get("ALLOWED_EXTENSIONS", {"png", "jpg", "jpeg", "webp"})
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed

def save_uploaded_file(file_storage, subfolder="complaints"):
    """
    Saves an uploaded file to the configured uploads folder with a unique UUID prefix.
    Returns the relative path for serving or storing in DB.
    """
    if not file_storage or not file_storage.filename:
        return None

    if not allowed_file(file_storage.filename):
        raise ValueError("Invalid file format. Allowed formats: PNG, JPG, JPEG, WEBP")

    original_filename = secure_filename(file_storage.filename)
    unique_filename = f"{uuid.uuid4().hex}_{original_filename}"

    upload_dir = os.path.join(current_app.config["UPLOAD_FOLDER"], subfolder)
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, unique_filename)
    file_storage.save(file_path)

    # Return relative URL path: /uploads/complaints/uuid_name.jpg
    return f"/uploads/{subfolder}/{unique_filename}"
