import React from 'react';
import CustomWebCam from '../Helpers/webCam';
import WebCamComponent from '../Helpers/Cam';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { faGoogle , faApple } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../styles/signin.css';

const Login = () => {
  return (
    <div className="container-login">
      <div className="header">
        <button className="close-button">
          <FontAwesomeIcon  icon={faClose} />
        </button>
        <a className="logo" href="#">
          <i className="fa-brands fa-twitter"></i>
        </a>
      </div>

      <div className="content">
        <h1>Log in to OBjet</h1>

        <div className="action-buttons">
          <button className="primary-button-1 sign-in-button">
            <FontAwesomeIcon style={{fontSize:'22px'}} icon={faGoogle} />
            <span>Sign in with Google</span>
          </button>
          <button className="primary-button-1 sign-in-button">
            <FontAwesomeIcon style={{fontSize:'25px'}} icon={faApple} />
            <span>Sign in with Apple</span>
          </button>
        </div>

        <div className="divider">
          <p>or</p>
        </div>

        <div className="email-log-in">
          <input type="text" id="log-in" placeholder="Email" />
          <label htmlFor="log-in">Phone, email or username</label>
        </div>

        <div className="action-buttons">
          <button className="primary-button-1">Next</button>
          <button className="secondary-button-1">Forgot Password?</button>
        </div>
      </div>

      <div className="sign-up">
        <p>Don't have an account? <a href="#">Sign up</a></p>
      </div>

      <button className='custom-button'>text</button>
    </div>

   
  );
}

export default Login;

