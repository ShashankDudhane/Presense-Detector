import sys, os, json, uuid
import cv2
import torch
import torchvision.models as models
import torchvision.transforms as transforms
import torch.nn.functional as F
from PIL import Image

# Load pretrained ResNet18 (ImageNet) and remove final classifier
model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
model.eval()
model = torch.nn.Sequential(*(list(model.children())[:-1]))

def load_and_preprocess_image(image_path):
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Image not found at {image_path}")
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    preprocess = transforms.Compose([
        transforms.ToPILImage(),
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])
    image_tensor = preprocess(image).unsqueeze(0)
    return image_tensor

def extract_frames_from_video(video_path, frame_skip=10):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise IOError(f"Could not open video file at {video_path}")
    frames = []
    frame_indices = []
    idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if idx % frame_skip == 0:
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            preprocess = transforms.Compose([
                transforms.ToPILImage(),
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                     std=[0.229, 0.224, 0.225])
            ])
            frame_tensor = preprocess(frame_rgb).unsqueeze(0)
            frames.append(frame_tensor)
            frame_indices.append(idx)
        idx += 1
    cap.release()
    return frames, frame_indices

def cosine_similarity(features1, features2):
    return F.cosine_similarity(features1.flatten().unsqueeze(0),
                               features2.flatten().unsqueeze(0)).item()

def run_detection(video_path, image_path,
                  output_dir="output",
                  threshold=0.65,
                  frame_skip=10,
                  max_results=9):
    results = {"success": False, "detections": [], "message": ""}

    if not os.path.exists(video_path) or not os.path.exists(image_path):
        results["message"] = "Missing input file"
        return results

    os.makedirs(output_dir, exist_ok=True)

    try:
        query_tensor = load_and_preprocess_image(image_path)
        with torch.no_grad():
            query_features = model(query_tensor).squeeze().flatten()
    except Exception as e:
        results["message"] = f"Query image error: {e}"
        return results

    try:
        video_tensors, frame_indices = extract_frames_from_video(video_path, frame_skip)
    except Exception as e:
        results["message"] = f"Video error: {e}"
        return results

    detections = []
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)

    total_frames = len(video_tensors)

    for i, frame_tensor in enumerate(video_tensors):
        with torch.no_grad():
            frame_features = model(frame_tensor).squeeze().flatten()
        sim = cosine_similarity(query_features, frame_features)
        if sim >= threshold:
            frame_idx = frame_indices[i]
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
            ret, frame = cap.read()
            if not ret:
                continue

            out_name = f"det_{frame_idx}_{uuid.uuid4().hex[:6]}.jpg"
            out_path = os.path.join(output_dir, out_name)
            cv2.imwrite(out_path, frame)

            detections.append({
                "frame": frame_idx,
                "time": round(frame_idx / fps, 2),
                "similarity": round(sim, 4),
                "imageUrl": f"/{out_path.replace(os.sep, '/')}"
            })

        # 🔹 Print progress every frame
        progress = int(((i + 1) / total_frames) * 100)
        print(json.dumps({"progress": progress}), flush=True)

        if len(detections) >= max_results:
            break

    cap.release()

    if detections:
        results["detections"] = sorted(detections, key=lambda x: x["similarity"], reverse=True)[:max_results]
        results["message"] = f"{len(results['detections'])} matches found"
    else:
        results["detections"] = [{"message": "No matches found"}]
        results["message"] = "No matches found"

    results["success"] = True
    return results

# CLI entrypoint
if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"success": False, "message": "Usage: python detection_model.py <video_path> <image_path>"}))
        sys.exit(1)
    video_path, image_path = sys.argv[1], sys.argv[2]
    result = run_detection(video_path, image_path)
    # 🔹 Print final result after progress logs
    print(json.dumps(result), flush=True)
