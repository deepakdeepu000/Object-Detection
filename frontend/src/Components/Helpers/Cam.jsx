import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Button, Container, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faImage } from '@fortawesome/free-solid-svg-icons';
import imageCompression from 'browser-image-compression';
import '../styles/webCam.css';

const WebCamComponent = () => {
  const webCamRef = useRef(null);
  const fileInput = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [upload, setUpload] = useState(false);
  const [detectionLabels, setDetectionLabels] = useState([]);
  const [isCamera, setCamera] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 300,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedImage(reader.result);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error compressing image:', error);
      }
    }
  };

  const toggleCamera = () => {
    setCamera((prevVisible) => !prevVisible);
  };

  const handleIconClick = () => {
    if (fileInput.current) {
      fileInput.current.click();
      setUpload(true);
    } else {
      console.error('File input ref is null');
    }
  };

  const reUploadImage = () => {
    setUploadedImage(null);
    if (fileInput.current) {
      fileInput.current.value = '';  // Clear the file input
      handleIconClick();
      setUpload(false);
    } else {
      console.error('File input ref is null');
    }
  };

  const captureImage = async () => {
    if (!webCamRef.current) {
      console.error('Webcam ref not available');
      return;
    }

    setUpload(false);

    try {
      const imageData = webCamRef.current.getScreenshot({ quality: 0.5 });
      setCapturedImage(imageData);
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  };

  const detectObjects = async () => {
    if (capturedImage) {
      sendImageToBackend(capturedImage);
      console.log('capturedImage:', capturedImage);
    } else if (uploadedImage) {
      sendImageToBackend(uploadedImage);
      
    }
  };

  const sendImageToBackend = async (image) => {
    try {
      const response = await fetch('http://localhost:8080/process_image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
      });
      const data = await response.json();
      setDetectionLabels(data.labels);
    } catch (error) {
      console.error('Error sending frame to backend:', error);
    }
  };

  return (
    <Container className="main-container">
      <div className='mother-container'>
        <div className='info-container'>
          <span className='text' style={{fontSize: '30px'}}>Object Detection</span>
          <div className='label-holder'>
            {detectionLabels.length > 0 ? <p className='label-text'>Detected Objects:</p> : <p className='label-text'>No objects detected</p>}
            {detectionLabels.map((label, index) => (
              <p className ='item-label'>
              <span id='span-id'></span>
              <span id='p-span-text' key={index}>
                {label.Name}
              </span>
              </p>
            ))}
          </div>
        </div>

        <div className="container-wrapper">
          {isCamera && !capturedImage && (
            <Card className="webcam-card">
              <Card.Body>
                <Webcam
                  ref={webCamRef}
                  className="webcam"
                  screenshotFormat="image/jpeg"
                  screenshotQuality={0.8}
                />
                <Button className="animated-button" onClick={captureImage}>
                  Capture
                </Button>
              </Card.Body>
            </Card>
          )}

          {(capturedImage || uploadedImage) && (
            <Card className="image-card">
              <Card.Body>
                <CapturedImage imageSrc={capturedImage || uploadedImage} />
                <div className="button-group" style={{ marginLeft: '10px' }}>
                  {upload ? 
                    <Button className='btn-ani' onClick={reUploadImage}>
                      <span className='btn-text'>Reupload</span>
                      <span className='btn-back'></span>
                    </Button> :
                    <Button className='btn-ani' onClick={() => setCapturedImage(null)}>
                      <span className='btn-text'>Retake</span>
                      <span className='btn-back'></span>
                    </Button>
                  }
                  <Button className='btn-ani btn-det' onClick={detectObjects}>
                    <span className='btn-text'>Detect</span>
                    <span className='btn-back'></span>
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}

          {!isCamera && !capturedImage && !uploadedImage && (
            <div className="placeholder-container">
              <div className="camcontainer" onClick={toggleCamera}>
                <FontAwesomeIcon className="cam-gg" icon={faCamera} style={{ fontSize: 'largest' }} />
              </div>
              <p> or </p>
              <div className="image-container" style={{ textAlign: 'center' }}>
                <input 
                  type="file" 
                  id="file" 
                  ref={fileInput} 
                  style={{ display: 'none' }} 
                  onChange={handleImageUpload} 
                />
                <FontAwesomeIcon 
                  icon={faImage} 
                  style={{ fontSize: '50px', cursor: 'pointer' }} 
                  onClick={handleIconClick} 
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

const CapturedImage = ({ imageSrc }) => {
  return (
    <div style={{ margin: '10px'}}>
      {imageSrc && <img style={{ borderRadius: '10px' }} src={imageSrc} alt="Captured" />}
    </div>
  );
};

export default WebCamComponent;
