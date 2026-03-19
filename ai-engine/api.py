"""
NeuroTract AI Engine — FastAPI Bridge
Connects the YOLO detector and ML predictor to the Node.js backend.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI(title="NeuroTract AI Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "engine": "NeuroTract AI", "version": "1.0.0"}


@app.get("/hazard-events")
def get_hazard_events():
    """Return pre-computed hazard events from JSON file."""
    events_path = os.path.join(os.path.dirname(__file__), "detector", "hazard_events.json")
    if os.path.exists(events_path):
        with open(events_path) as f:
            return json.load(f)
    return {"events": []}


@app.post("/detect")
def detect_frame():
    """Placeholder for live frame detection endpoint."""
    return {"message": "Live detection endpoint — requires YOLO model and video frame input."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
