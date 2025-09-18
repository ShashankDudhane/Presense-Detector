# Presense Detection App

A React + Tailwind frontend with a Python FastAPI backend that allows users to upload an image and a video, and detect occurrences of the image in the video. Includes progress tracking with a smooth animated progress bar.

---

## Features

- Drag & drop or click to upload images and videos.
- Real-time progress updates while processing.
- Smooth animated progress bar.
- Detection results displayed upon completion.
- Toast notifications for status updates.

---

## Tech Stack

- **Frontend:** React, Tailwind CSS, Lucide React icons, React Hot Toast, Axios  
- **Backend:** FastAPI, Uvicorn  
- **Others:** FormData uploads, video processing (backend logic)

---

## Installation & Running Locally

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <repo-folder>


cd backend
# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate      # Linux / macOS
venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn main:app --reload




cd frontend
# Install dependencies
npm install

# Start development server
npm run dev
