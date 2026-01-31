import cv2
import torch
import os
from datetime import datetime
import streamlit as st
from face_ops import get_face_embedding, OUTPUT_DIR

def is_loitering_active(track_id, current_time, track_history, threshold):
    """Calculates if the track duration exceeds the threshold."""
    if track_id in track_history:
        time_in_area = current_time - track_history[track_id][0]
        return time_in_area >= threshold
    return False

def handle_loitering_alert(frame, track_id, loitering_saved_state, face_models, trusted_embeddings):
    """
    Handles the loitering event: saves frame, runs face recognition, and alerts user.
    """
    # Prevent repeated processing for the same track ID
    if loitering_saved_state[track_id]:
        return

    detector, facenet = face_models
    
    # 1. Save the main context frame
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"loitering_{track_id}_{timestamp}.jpg"
    cv2.imwrite(filename, frame)
    
    # 2. Perform Face Recognition on this frame
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    faces = detector.detect_faces(rgb_frame)
    
    for face in faces:
        fx, fy, fwidth, fheight = face['box']
        if face['confidence'] < 0.9: continue
        
        face_image = rgb_frame[fy:fy+fheight, fx:fx+fwidth]
        if face_image.size == 0: continue

        embedding = get_face_embedding(face_image, facenet)
        
        # Compare against trusted faces
        is_trusted = False
        for _, trusted_embedding in trusted_embeddings:
            distance = torch.dist(embedding, trusted_embedding).item()
            if distance < 1.0:
                is_trusted = True
                break
        
        # If unknown, save the specific face crop
        if not is_trusted:
            face_ts = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
            face_filename = os.path.join(OUTPUT_DIR, f"face_{face_ts}.jpg")
            cv2.imwrite(face_filename, cv2.cvtColor(face_image, cv2.COLOR_RGB2BGR))
    
    st.toast(f"Loitering alert! ID: {track_id}", icon="🚨")
    
    # Mark this ID as processed
    loitering_saved_state[track_id] = True
