import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './Components/LandingPage';
import SpeechText from './Components/SpeechText';
import SpeechTranslation from './Components/SpeechTranslation';
import TextTranslation from './Components/TextTranslation';
import TextSpeech from './Components/TextSpeech';
import LoginPage from './Components/LoginPage';
import PrivateRoute from "./Components/PrivateRoute"; 
import './App.css';

const App = () => {
    return (
        <Router>
            <Routes>
                {/* Public Route */}
                <Route path="/" element={<LoginPage />} />
                {/* <Route path="/landingpage" element={<PrivateRoute element={<LandingPage />} />} /> */}


                {/* Protected Routes */}
                <Route path="/landingpage" element={<PrivateRoute element={<LandingPage />} />} />
                <Route path="/speechtext" element={<PrivateRoute element={<SpeechText />} />} />
                <Route path="/speechtranslation" element={<PrivateRoute element={<SpeechTranslation />} />} />
                <Route path="/textspeech" element={<PrivateRoute element={<TextSpeech />} />} />
                <Route path="/texttranslation" element={<PrivateRoute element={<TextTranslation />} />} />
            </Routes>
        </Router>
    );
};

export default App;
