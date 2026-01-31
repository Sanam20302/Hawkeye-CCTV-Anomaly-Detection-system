import streamlit as st
import cv2
from collections import defaultdict
from ultralytics import YOLO
from deep_sort_realtime.deepsort_tracker import DeepSort
import os

# Import local modules
from face_ops import init_face_models, load_trusted_faces, view_detected_faces_ui
from detection_ops import process_frame_annotations

# Streamlit UI setup
st.set_page_config(page_title="Loitering & Crowd Detection", layout="wide")
st.title("hawkeye")

# Sidebar navigation
page = st.sidebar.radio("Navigation", ["Home", "View Detected Faces"])

# --- Cache Heavy Loaders ---
@st.cache_resource
def load_yolo_and_tracker():
    """Load YOLO model and DeepSort tracker (cached)."""
    yolo = YOLO("yolov8n.pt")
    tracker = DeepSort(max_age=20, n_init=2, nms_max_overlap=1.0)
    return yolo, tracker

@st.cache_resource
def load_face_system():
    """Load FaceNet/MTCNN models and trusted faces (cached)."""
    detector, facenet = init_face_models()
    trusted_embeddings = load_trusted_faces(detector, facenet)
    return detector, facenet, trusted_embeddings

# Initialize Models
try:
    yolo_model, deepsort_tracker = load_yolo_and_tracker()
    detector, facenet, trusted_face_embeddings = load_face_system()
except Exception as e:
    st.error(f"Error loading models: {e}")
    st.stop()

if page == "Home":
    # --- Sidebar Settings ---
    st.sidebar.header("Settings")
    
    settings = {}
    settings['loitering_threshold'] = st.sidebar.slider("Loitering Threshold (seconds)", 5, 30, 10)
    settings['crowd_threshold'] = st.sidebar.slider("Crowd Threshold (people)", 2, 10, 5)
    confidence_threshold = st.sidebar.slider("Confidence Threshold", 0.1, 1.0, 0.4)

    st.sidebar.header("Trespassing Zone")
    t_x1 = st.sidebar.slider("X1", 0, 640, 100)
    t_y1 = st.sidebar.slider("Y1", 0, 480, 100)
    t_x2 = st.sidebar.slider("X2", 0, 640, 500)
    t_y2 = st.sidebar.slider("Y2", 0, 480, 400)
    settings['trespassing_zone'] = (t_x1, t_y1, t_x2, t_y2)

    # Toggles
    settings['trespassing_enabled'] = st.sidebar.toggle("Trespassing Detection", value=False)
    settings['loitering_enabled'] = st.sidebar.toggle("Loitering Detection", value=False)
    settings['crowd_enabled'] = st.sidebar.toggle("Crowd Detection", value=False)

    # --- Video Control ---
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        start_button = st.button("Start Video Processing")
        stop_button = st.button("Stop Video Processing")

    # Session State Management
    if 'processing' not in st.session_state:
        st.session_state.processing = False

    if start_button:
        st.session_state.processing = True
    if stop_button:
        st.session_state.processing = False

    # Layout for feeds
    col11, col12 = st.columns(2)
    col13, col14 = st.columns(2)
    cam1_placeholder = col11.empty()
    cam2_placeholder = col12.empty()
    cam3_placeholder = col13.empty()
    cam4_placeholder = col14.empty()
    
    # Placeholder image for disconnected cams
    # Ensure you have a 'ss.jfif' or similar placeholder image in the directory
    local_image_path = "ss.jfif" 

    # State for tracking history
    if 'track_history' not in st.session_state:
        st.session_state.track_history = defaultdict(lambda: [])
    if 'loitering_saved' not in st.session_state:
        st.session_state.loitering_saved = defaultdict(lambda: False)

    # --- Main Video Loop ---
    if st.session_state.processing:
        # Use 0 for default webcam. Change to 1 or RTSP URL if needed.
        cap = cv2.VideoCapture(1) 
        
        if not cap.isOpened():
            st.error("Error: Could not open camera.")
            st.session_state.processing = False
        else:
            frame_count = 0
            fps = int(cap.get(cv2.CAP_PROP_FPS)) if cap.get(cv2.CAP_PROP_FPS) > 0 else 30

            while st.session_state.processing:
                ret, frame = cap.read()
                if not ret:
                    st.error("Failed to read frame.")
                    break

                frame_count += 1
                current_time = frame_count / fps
                
                # Resize for consistency and performance
                resized_frame = cv2.resize(frame, (640, 480))

                # YOLO Inference (Skip frames for performance)
                if frame_count % 5 == 0:
                    results = yolo_model(resized_frame, stream=True, conf=confidence_threshold)
                    detections_list = []
                    
                    for result in results:
                        boxes = result.boxes.cpu().numpy()
                        for box in boxes:
                            x1, y1, x2, y2 = box.xyxy[0]
                            conf = box.conf[0]
                            cls_id = box.cls[0]
                            
                            # Class 0 is 'person' in COCO dataset
                            if cls_id == 0: 
                                detections_list.append([[x1, y1, x2-x1, y2-y1], conf, 0])
                    
                    # Update tracker with new detections
                    outputs = deepsort_tracker.update_tracks(detections_list, frame=resized_frame)
                else:
                    # Update tracker without new detections to maintain tracks
                    outputs = deepsort_tracker.update_tracks([], frame=resized_frame)

                # Process Logic (Annotate Frame)
                final_frame = process_frame_annotations(
                    resized_frame, 
                    outputs, 
                    current_time, 
                    st.session_state.track_history,
                    st.session_state.loitering_saved,
                    settings,
                    (detector, facenet),
                    trusted_face_embeddings
                )

                # Convert to RGB for Streamlit
                frame_rgb = cv2.cvtColor(final_frame, cv2.COLOR_BGR2RGB)
                
                # Update Camera 1 Feed
                cam1_placeholder.image(frame_rgb, channels="RGB", caption="Cam 1: Live Feed")
                
                # Update Disconnected Camera Placeholders
                if os.path.exists(local_image_path):
                    cam2_placeholder.image(local_image_path, caption="Cam 2: Disconnected", width=400)
                    cam3_placeholder.image(local_image_path, caption="Cam 3: Disconnected", width=400)
                    cam4_placeholder.image(local_image_path, caption="Cam 4: Disconnected", width=400)
                else:
                    cam2_placeholder.info("Cam 2: Disconnected (Image not found)")
                    cam3_placeholder.info("Cam 3: Disconnected (Image not found)")
                    cam4_placeholder.info("Cam 4: Disconnected (Image not found)")

            cap.release()

elif page == "View Detected Faces":
    view_detected_faces_ui()
