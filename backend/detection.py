# detection.py
import cv2
import face_recognition
import sys
import json

def run_detection(input_video, template_img, output_video):
    # Load the face image and encode
    known_image = face_recognition.load_image_file(template_img)
    known_encoding = face_recognition.face_encodings(known_image)
    if not known_encoding:
        return {"success": False, "message": "No face found in uploaded image"}
    known_encoding = known_encoding[0]

    cap = cv2.VideoCapture(input_video)
    if not cap.isOpened():
        return {"success": False, "message": "Could not open video"}

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(output_video, fourcc, 20.0, (int(cap.get(3)), int(cap.get(4))))

    detections = []
    frame_num = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        found = False
        for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
            match = face_recognition.compare_faces([known_encoding], face_encoding)[0]
            if match:
                cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)
                detections.append({"frame": frame_num, "message": "Face detected"})
                found = True

        # Overlay text
        if found:
            cv2.putText(frame, f"Frame {frame_num}: Face detected", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
        else:
            cv2.putText(frame, "No face detected", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)

        out.write(frame)
        frame_num += 1

    cap.release()
    out.release()

    return {
        "success": True,
        "output_video": output_video,
        "detections": detections if detections else [{"message": "No face detected in video"}]
    }

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print(json.dumps({"success": False, "message": "Usage: python detection.py <input_video> <template_img> <output_video>"}))
        sys.exit(1)

    input_video = sys.argv[1]
    template_img = sys.argv[2]
    output_video = sys.argv[3]

    result = run_detection(input_video, template_img, output_video)
    print(json.dumps(result))
