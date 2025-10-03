// web speech Api replaced with Azure Speech Translation SDK

import React, { useRef, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Grid } from '@mui/material';
import MicNoneIcon from '@mui/icons-material/MicNone';
import './SpeechTranslation.css';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

const SpeechTranslation = () => {
  const [recognizedText, setRecognizedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en-US'); // Default source language
  const [targetLanguage, setTargetLanguage] = useState('te'); // Default target language
  const [listening, setListening] = useState(false);

  const microphoneRef = useRef(null);
  let recognizerRef = useRef(null);

  const languages = [
    { code: 'en-US', name: 'English' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'pt-PT', name: 'Portuguese' },
    { code: 'hi-IN', name: 'Hindi' },
    { code: 'zh-CN', name: 'Chinese' },
    { code: 'te-IN', name: 'Telugu' }
  ];

  // Azure Speech Translation credentials
  


  const speechKey = process.env.REACT_APP_AZURE_SPEECH_KEY;
  const speechRegion = process.env.REACT_APP_SPEECH_REGION;

  const handleReset = () => {
    setRecognizedText('');
    setTranslatedText('');
    setError('');
    setListening(false);
    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync(() => {
        recognizerRef.current.close();
        recognizerRef.current = null;
      });
    }
  };

  const startSpeechRecognition = () => {
    setError('');
    setRecognizedText('');
    setTranslatedText('');
    setListening(true);
    setLoading(true);
    microphoneRef.current.classList.add("listening");

    try {
      const speechConfig = SpeechSDK.SpeechTranslationConfig.fromSubscription(speechKey, speechRegion);
      speechConfig.speechRecognitionLanguage = sourceLanguage;
      speechConfig.addTargetLanguage(targetLanguage);

      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new SpeechSDK.TranslationRecognizer(speechConfig, audioConfig);
      recognizerRef.current = recognizer;

      recognizer.recognized = (s, e) => {
        if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech || e.result.reason === SpeechSDK.ResultReason.TranslatedSpeech) {
          setRecognizedText(e.result.text);
          const translated = e.result.translations.get(targetLanguage);
          setTranslatedText(translated);
          setLoading(false);

          // Speak out the translation
          speechConfig.speechSynthesisVoiceName =
            targetLanguage === "te-IN" ? "te-IN-ShrutiNeural" :
              targetLanguage === "hi-IN" ? "hi-IN-SwaraNeural" :
                "en-US-AriaNeural";

          const audioConfigOut = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
          const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfigOut);

          synthesizer.speakTextAsync(
            translated,
            result => {
              synthesizer.close();
            },
            error => {
              console.error("Error during speech synthesis:", error);
              synthesizer.close();
            }
          );
        }
      };

      recognizer.startContinuousRecognitionAsync();

    } catch (err) {
      console.error(err);
      setError('Error initializing Azure Speech Translation.');
      setLoading(false);
    }
  };


  const stopHandle = () => {
    setListening(false);
    microphoneRef.current.classList.remove("listening");
    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync(() => {
        recognizerRef.current.close();
        recognizerRef.current = null;
      });
    }
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar variant="dense" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" color="inherit" component="div">
              Miracle Open Voice
            </Typography>
            <Typography variant="h6" color="inherit" component="div" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              Speech to Speech
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>

      <Grid container spacing={2} style={{ margin: 20 }}>
        <Grid item xs={5}>
          <Box border={1} padding={2} borderRadius={1}>
            <label>
              Source Language:
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                style={{ marginLeft: '10px' }}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </label>
            {recognizedText && (
              <div style={{ marginTop: '20px' }}>
                <h3>Recognized Text</h3>
                <p>{recognizedText}</p>
              </div>
            )}
          </Box>
        </Grid>

        <Grid item xs={5}>
          <Box border={1} padding={2} borderRadius={1}>
            <label>
              Target Language:
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                style={{ marginLeft: '10px' }}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </label>

            {loading ? (
              <h4>Loading...</h4>
            ) : (
              translatedText && (
                <div style={{ marginTop: '20px' }}>
                  <h3>Translated Text</h3>
                  <p>{translatedText}</p>
                </div>
              )
            )}
          </Box>
        </Grid>
      </Grid>

      <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
        <div className="microphone-wrapper">
          <div className="mircophone-container">
            <div
              className="microphone-icon-container"
              ref={microphoneRef}
              onClick={startSpeechRecognition}
            >
              <MicNoneIcon style={{ color: '#000', fontSize: '48px' }} />
            </div>
            <div className="microphone-status">
              {listening ? "Listening..." : "Click to start Listening"}
            </div>

            {listening && (
              <button className="microphone-stop btn" onClick={stopHandle}>
                Stop
              </button>
            )}
          </div>
          <div>
            <button className="microphone-reset btn" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </>
  );
};

export default SpeechTranslation;
