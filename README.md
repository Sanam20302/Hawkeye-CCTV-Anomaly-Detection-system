# Hawkeye: AI-Powered Real-Time Surveillance System

## Description

hawkeye is an advanced, real-time video processing application designed for automated surveillance. It leverages state-of-the-art computer vision models to detect and flag anomalous events from live camera feeds. The system is built on a Streamlit web interface and integrates object detection, object tracking, and facial recognition to provide a comprehensive monitoring solution.

The application is capable of identifying three primary anomalies:

- Loitering: Detects individuals who remain in the frame for longer than a user-defined time threshold.

- Crowd Formation: Triggers an alert when the number of people detected exceeds a set limit.

- Trespassing: Flags individuals who enter a user-defined restricted zone.

A key feature is its integration of facial recognition. When a loitering event is detected, the system extracts the subject's face, compares it against a pre-registered database of "trusted" individuals, and saves the face for review if it is an unknown person.

## Core Features
- Real-Time Anomaly Detection: Concurrently monitors for loitering, crowd, and trespassing events.

- Persistent Object Tracking: Utilizes YOLOv8 for detection and DeepSORT for tracking, assigning a stable ID to each person to monitor their behavior over time.

- Face Recognition & Verification:
  - Employs MTCNN for robust face detection.
  - Uses FaceNet (InceptionResnetV1) to generate facial embeddings.
  - Automatically compares faces of loitering individuals against a "trusted" database.

- Unknown Face Logging: If a loitering individual is not found in the trusted database, their cropped face image is saved to disk for subsequent review.

- Interactive Web Interface:

  - Built with Streamlit for an accessible and responsive user interface.

  - Features a dynamic dashboard for live feeds and system alerts.

  - Includes a separate page to review all logged faces of unknown individuals.

- Dynamic Configuration: Allows the user to set all detection parameters (loitering time, crowd count, trespassing zone coordinates) directly from the UI.

## Technologies Used
- Application Framework: Streamlit

- Object Detection: YOLOv8 (from Ultralytics)

- Object Tracking: DeepSORT (deep_sort_realtime)

- Face Detection: MTCNN (mtcnn)

- Face Recognition: FaceNet (facenet-pytorch)

- Core Libraries: OpenCV, PyTorch, NumPy, PIL
