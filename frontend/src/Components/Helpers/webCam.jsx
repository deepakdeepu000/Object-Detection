import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const WebcamCapture = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [labels, setLabels] = useState([]);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    if (file) {
      formData.append('image', file);
    } else if (image) {
      const blob = await fetch(image).then((res) => res.blob());
      formData.append('image', blob);
    }

    try {
      const response = await axios.post('http://localhost:3000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setLabels(response.data);
    } catch (error) {
      console.error('Error uploading the image:', error);
    }
  };

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
      />
      <button onClick={capture}>Capture Photo</button>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload Image</button>
      {image && <img src={image} alt="Captured or Uploaded" style={{ position: 'relative' }} />}
      {image && labels.map((label, index) => (
        label.Instances.map((instance, i) => {
          const box = instance.BoundingBox;
          const imageElement = document.querySelector('img');
          const imgWidth = imageElement ? imageElement.width : 0;
          const imgHeight = imageElement ? imageElement.height : 0;
          return (
            <div
              key={`${index}-${i}`}
              style={{
                border: '2px solid red',
                position: 'absolute',
                left: `${box.Left * imgWidth}px`,
                top: `${box.Top * imgHeight}px`,
                width: `${box.Width * imgWidth}px`,
                height: `${box.Height * imgHeight}px`
              }}
            />
          );
        })
      ))}
      {labels.length > 0 && (
        <div>
          <h3>Detected Labels:</h3>
          <ul>
            {labels.map((label, index) => (
              <li key={index}>{label.Name} ({label.Confidence.toFixed(2)}%)</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
