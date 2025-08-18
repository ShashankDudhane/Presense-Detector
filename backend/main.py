from fastapi import FastAPI, UploadFile
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import subprocess
import os
import uuid
import json
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static output video files
os.makedirs("uploads", exist_ok=True)
os.makedirs("output", exist_ok=True)
app.mount("/output", StaticFiles(directory="output"), name="output")


@app.post("/upload/")
async def upload(video: UploadFile, image: UploadFile):
    video_path = f"uploads/{uuid.uuid4()}_{video.filename}"
    image_path = f"uploads/{uuid.uuid4()}_{image.filename}"
    output_path = f"output/{uuid.uuid4()}_processed.mp4"

    # Save uploaded files
    with open(video_path, "wb") as f:
        f.write(await video.read())
    with open(image_path, "wb") as f:
        f.write(await image.read())

    # Run face detection script
    result = subprocess.run(
        ["python", "detection.py", video_path, image_path, output_path],
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        return JSONResponse(
            content={"success": False, "error": result.stderr},
            status_code=500,
        )

    try:
        detection_result = json.loads(result.stdout.strip())
    except json.JSONDecodeError:
        detection_result = {"detections": []}

    # Return video URL and detections
    return JSONResponse(
        content={
            "success": True,
            "videoUrl": f"/{output_path}",
            "detections": detection_result.get("detections", []),
            "message": f"{len(detection_result.get('detections', []))} face(s) detected"
                       if detection_result.get("detections") else "No face detected",
        }
    )
