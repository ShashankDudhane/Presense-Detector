from fastapi import FastAPI, UploadFile
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import subprocess, os, uuid, json, sys, threading

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure folders exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("output", exist_ok=True)

# Serve cropped/matched frames
app.mount("/output", StaticFiles(directory="output"), name="output")

# Store job progress + results
progress_store = {}

def run_detection_background(job_id, video_path, image_paths):
    py = sys.executable
    process = subprocess.Popen(
        [py, "detection_model.py", video_path] + image_paths,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )

    final_output = None

    for line in process.stdout:
        line = line.strip()
        if not line:
            continue
        try:
            data = json.loads(line)
        except json.JSONDecodeError:
            continue

        # Progress update
        if "progress" in data:
            progress_store[job_id] = {
                "progress": data["progress"],
                "status": "processing"
            }
        else:
            # This should be the final result JSON
            final_output = data
            progress_store[job_id] = {
                "progress": 100,
                "status": "completed" if final_output.get("success") else "failed",
                "result": final_output
            }

    process.wait()

    # If no final output was captured
    if final_output is None:
        stderr_output = process.stderr.read()
        progress_store[job_id] = {
            "progress": 100,
            "status": "failed",
            "result": {
                "success": False,
                "error": "Detection script failed",
                "details": stderr_output
            }
        }

@app.post("/upload/")
async def upload(video: UploadFile, images: list[UploadFile]):
    # Save video
    video_path = os.path.join("uploads", f"{uuid.uuid4()}_{video.filename}")
    with open(video_path, "wb") as f:
        f.write(await video.read())

    # Save multiple images
    image_paths = []
    for img in images:
        img_path = os.path.join("uploads", f"{uuid.uuid4()}_{img.filename}")
        with open(img_path, "wb") as f:
            f.write(await img.read())
        image_paths.append(img_path)

    job_id = str(uuid.uuid4())
    progress_store[job_id] = {"progress": 0, "status": "pending"}

    # Run detection in background
    threading.Thread(
        target=run_detection_background,
        args=(job_id, video_path, image_paths),
        daemon=True
    ).start()

    return {"job_id": job_id}

@app.get("/progress/{job_id}")
async def progress(job_id: str):
    if job_id not in progress_store:
        return {"progress": 0, "status": "pending"}

    entry = progress_store[job_id]
    response = {
        "progress": entry.get("progress", 0),
        "status": entry.get("status", "processing")
    }

    if "result" in entry:
        response["result"] = entry["result"]

    return response
