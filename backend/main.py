from fastapi import FastAPI, UploadFile
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import subprocess, os, uuid, json, sys

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

# Serve cropped/matched frames at http://127.0.0.1:8000/output/...
app.mount("/output", StaticFiles(directory="output"), name="output")

@app.post("/upload/")
async def upload(video: UploadFile, image: UploadFile):
    try:
        # Save incoming files
        video_path = os.path.join("uploads", f"{uuid.uuid4()}_{video.filename}")
        image_path = os.path.join("uploads", f"{uuid.uuid4()}_{image.filename}")

        with open(video_path, "wb") as f:
            f.write(await video.read())
        with open(image_path, "wb") as f:
            f.write(await image.read())

        # Use the same interpreter that's running FastAPI
        py = sys.executable

        # Run detection script and capture JSON
        result = subprocess.run(
            [py, "detection_model.py", video_path, image_path],
            capture_output=True,
            text=True
        )

        # Helpful logs for debugging (visible in server console)
        print("=== detection_model.py STDOUT ===")
        print(result.stdout)
        print("=== detection_model.py STDERR ===")
        print(result.stderr)

        if result.returncode != 0:
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": "Detection script failed",
                    "details": result.stderr
                }
            )

        stdout = (result.stdout or "").strip()
        if not stdout:
            return JSONResponse(
                status_code=500,
                content={"success": False, "error": "Empty response from detection script"}
            )

        try:
            detection_result = json.loads(stdout)
        except json.JSONDecodeError as e:
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": "Invalid JSON from detection script",
                    "details": str(e),
                    "raw": stdout[:5000],
                },
            )

        # ✅ Always pass detection_model.py result back to client
        return JSONResponse(status_code=200, content=detection_result)

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )
