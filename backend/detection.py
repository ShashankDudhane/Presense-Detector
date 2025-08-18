from fastapi import FastAPI, UploadFile
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import os
import uuid
import json

app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure directories exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("output", exist_ok=True)
app.mount("/output", StaticFiles(directory="output"), name="output")

@app.post("/upload/")
async def upload(video: UploadFile, image: UploadFile):
    try:
        video_path = f"uploads/{uuid.uuid4()}_{video.filename}"
        image_path = f"uploads/{uuid.uuid4()}_{image.filename}"
        output_path = f"output/{uuid.uuid4()}_processed.mp4"

        # Save files
        with open(video_path, "wb") as f:
            f.write(await video.read())
        with open(image_path, "wb") as f:
            f.write(await image.read())

        # Run detection.py
        result = subprocess.run(
            ["python", "detection.py", video_path, image_path, output_path],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            return JSONResponse(
                content={"success": False, "error": result.stderr},
                status_code=500
            )

        try:
            detection_result = json.loads(result.stdout.strip())
        except json.JSONDecodeError:
            detection_result = {"detections": []}

        return JSONResponse(
            content={
                "success": True,
                "videoUrl": f"/{output_path}",
                "detections": detection_result.get("detections", []),
                "message": f"{len(detection_result.get('detections', []))} face(s) detected"
                           if detection_result.get("detections") else "No face detected",
            }
        )

    except Exception as e:
        return JSONResponse(
            content={"success": False, "error": str(e)},
            status_code=500
        )
