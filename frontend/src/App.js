import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/Mainframes/Home';
import WebCamComponent from './Components/Helpers/Cam';

function App() {
  return (
    <Router>  
      <Routes>
        <Route path="/" element={<WebCamComponent/>} />
      </Routes>
    </Router>
  );
}

export default App;
