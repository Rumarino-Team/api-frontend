import { useEffect, useRef, useState } from "react";

const RealtimeDetections = () => {
  const [detections, setDetections] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8000/detections/stream");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setDetections(data);
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((detector) => {
      detector.detections.forEach((detection) => {
        const { x_offset, y_offset, width, height } = detection.bounding_box;

        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(x_offset, y_offset, width, height);

        // Draw label
        ctx.fillStyle = "red";
        ctx.font = "14px Arial";
        ctx.fillText(
          `${detection.cls} (${(detection.confidence * 100).toFixed(1)}%)`,
          x_offset,
          y_offset - 5
        );
      });
    });
  }, [detections]);

  return (
    <div className="container">
      <h1 className="title">Real-Time Detections</h1>
      <div className="canvas-container">
        <canvas ref={canvasRef} width={640} height={480} className="detection-canvas"></canvas>
      </div>
      {detections.length === 0 ? (
        <p className="no-detections">No detections yet...</p>
      ) : (
        <div className="grid">
          {detections.map((detector, index) => (
            <div key={index} className="card">
              <h2 className="detector-name">{detector.detector_name}</h2>
              {detector.detections.length > 0 ? (
                <ul className="detection-list">
                  {detector.detections.map((detection, i) => (
                    <li key={i} className="detection-item">
                      <p><strong>Class:</strong> {detection.cls}</p>
                      <p><strong>Confidence:</strong> {(detection.confidence * 100).toFixed(2)}%</p>
                      <p><strong>Position:</strong> x: {detection.point.x}, y: {detection.point.y}, z: {detection.point.z}</p>
                      <p><strong>Bounding Box:</strong> x: {detection.bounding_box.x_offset}, y: {detection.bounding_box.y_offset}, w: {detection.bounding_box.width}, h: {detection.bounding_box.height}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-detection">No detections available.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RealtimeDetections;

// Styles
const styles = `
  .container {
    padding: 1rem;
    background-color: #f3f4f6;
    min-height: 100vh;
  }
  .title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
    text-align: center;
  }
  .no-detections {
    text-align: center;
    color: #4b5563;
  }
  .canvas-container {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }
  .detection-canvas {
    border: 2px solid black;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }
  .card {
    border: 1px solid #e5e7eb;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    background-color: white;
  }
  .detector-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2563eb;
  }
  .detection-list {
    margin-top: 0.5rem;
  }
  .detection-item {
    padding: 0.5rem;
    border-bottom: 1px solid #d1d5db;
  }
  .no-detection {
    color: #6b7280;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
