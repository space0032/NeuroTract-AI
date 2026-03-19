"""
YOLOv8 Hazard Detector
Analyzes dashcam video frames to detect pedestrians and vehicles,
identifies hazard events, and records timestamps.

Usage:
    python yolo_detector.py --video path/to/dashcam.mp4 --output hazard_events.json
"""
import json
import argparse
import os


def detect_hazards(video_path, output_path=None, confidence_threshold=0.5):
    """
    Run YOLOv8 on a video file and detect hazard events.
    
    Args:
        video_path: Path to the dashcam video file
        output_path: Path to save the hazard events JSON
        confidence_threshold: Minimum confidence for detections
    
    Returns:
        List of hazard event dictionaries
    """
    try:
        from ultralytics import YOLO
        import cv2
    except ImportError:
        print("⚠️  ultralytics and opencv-python required. Install with:")
        print("    pip install ultralytics opencv-python")
        return []

    model = YOLO("yolov8n.pt")  # Nano model for speed
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    hazard_events = []
    frame_idx = 0
    
    # Define danger zone (center-bottom of frame where hazards would appear)
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        results = model(frame, verbose=False)
        
        for result in results:
            for box in result.boxes:
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                class_name = model.names[cls]
                
                # Check for pedestrians or vehicles in danger zone
                if conf >= confidence_threshold and class_name in ["person", "car", "truck", "bus", "motorcycle"]:
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    timestamp_ms = int((frame_idx / fps) * 1000)
                    
                    hazard_events.append({
                        "frame": frame_idx,
                        "timestamp_ms": timestamp_ms,
                        "event_type": "pedestrian_entry" if class_name == "person" else "vehicle_approach",
                        "object_class": class_name,
                        "confidence": round(conf, 3),
                        "bbox": {"x1": round(x1), "y1": round(y1), "x2": round(x2), "y2": round(y2)},
                        "description": f"{class_name} detected at {timestamp_ms}ms"
                    })
        
        frame_idx += 1
    
    cap.release()
    
    if output_path:
        with open(output_path, "w") as f:
            json.dump({"video": video_path, "events": hazard_events}, f, indent=2)
        print(f"✓ Saved {len(hazard_events)} hazard events to {output_path}")
    
    return hazard_events


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="YOLOv8 Hazard Detector")
    parser.add_argument("--video", required=True, help="Path to dashcam video")
    parser.add_argument("--output", default="hazard_events.json", help="Output JSON path")
    parser.add_argument("--confidence", type=float, default=0.5, help="Confidence threshold")
    args = parser.parse_args()
    
    detect_hazards(args.video, args.output, args.confidence)
