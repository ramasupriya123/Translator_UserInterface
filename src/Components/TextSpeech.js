import React, { useState, useRef } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Button, Select, MenuItem, Paper, TextField, Snackbar, Alert } from "@mui/material";
import { useDropzone } from "react-dropzone";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

const TextSpeech = () => {
  const [text, setText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const audioRef = useRef(null);
  const lastAudioUrlRef = useRef(null);

  



const speechKey = process.env.REACT_APP_AZURE_SPEECH_KEY;
const speechRegion = process.env.REACT_APP_SPEECH_REGION;


const translatorKey = process.env.REACT_APP_AZURE_TEXT_KEY;
const translatorRegion = process.env.REACT_APP_TRANSLATOR_REGION;
const translatorEndpoint = process.env.REACT_APP_TRANSLATOR_ENDPOINT;


  const languages = [
    { code: "en-US", name: "English", voice: "en-US-AriaNeural", isoCode: "en" },
    { code: "es-ES", name: "Spanish", voice: "es-ES-ElviraNeural", isoCode: "es" },
    { code: "fr-FR", name: "French", voice: "fr-FR-DeniseNeural", isoCode: "fr" },
    { code: "de-DE", name: "German", voice: "de-DE-KatjaNeural", isoCode: "de" },
    { code: "zh-CN", name: "Chinese", voice: "zh-CN-XiaoxiaoNeural", isoCode: "zh" },
    { code: "ja-JP", name: "Japanese", voice: "ja-JP-NanamiNeural", isoCode: "ja" },
    { code: "hi-IN", name: "Hindi", voice: "hi-IN-SwaraNeural", isoCode: "hi" },
    { code: "te-IN", name: "Telugu", voice: "te-IN-ShrutiNeural", isoCode: "te" },
  ];

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => setText(reader.result);
    reader.readAsText(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ".txt",
  });

  const detectLanguage = async (inputText) => {
    try {
      const res = await fetch(`${translatorEndpoint}/detect?api-version=3.0`, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": translatorKey,
          "Ocp-Apim-Subscription-Region": translatorRegion,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ Text: inputText }]),
      });

      if (!res.ok) {
        console.warn("Translator detect returned non-OK:", res.status, await res.text());
        return null;
      }

      const json = await res.json();
      return json?.[0]?.language ?? null;
    } catch (err) {
      console.error("detectLanguage error:", err);
      return null;
    }
  };

  const synthesizeToAudioUrl = (speechText, voiceName) => {
    return new Promise((resolve, reject) => {
      try {
        const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(speechKey, speechRegion);
        if (voiceName) speechConfig.speechSynthesisVoiceName = voiceName;

        const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, null);

        synthesizer.speakTextAsync(
          speechText,
          (result) => {
            const audioData = result?.audioData;
            if (!audioData) {
              synthesizer.close();
              return reject(new Error("No audioData returned by SDK."));
            }
            const blob = new Blob([audioData], { type: "audio/wav" });
            const url = URL.createObjectURL(blob);
            synthesizer.close();
            resolve(url);
          },
          (err) => {
            synthesizer.close();
            reject(err);
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  };

  const handleSpeech = async () => {
    if (!text.trim()) {
      setAlertMsg("Please enter some text to convert to speech.");
      setAlertOpen(true);
      return;
    }

    const selectedLang = languages.find((l) => l.code === selectedLanguage);
    if (!selectedLang) return;

    let detectedLang = null;
    try {
      detectedLang = await detectLanguage(text);
    } catch {
      detectedLang = null;
    }

    if (detectedLang && !detectedLang.toLowerCase().startsWith(selectedLang.isoCode.toLowerCase())) {
      setAlertMsg(`⚠️ Language mismatch Detected`);
      setAlertOpen(true);
      return;
    }

    try {
      if (lastAudioUrlRef.current) URL.revokeObjectURL(lastAudioUrlRef.current);

      const url = await synthesizeToAudioUrl(text, selectedLang.voice);
      lastAudioUrlRef.current = url;

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(console.error);
      }
    } catch (err) {
      console.error("TTS / playback error:", err);
      setAlertMsg("Failed to process or play speech. See console for details.");
      setAlertOpen(true);
    }
  };

  const handleStopSpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (lastAudioUrlRef.current) {
      URL.revokeObjectURL(lastAudioUrlRef.current);
      lastAudioUrlRef.current = null;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar variant="dense" sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" color="inherit">Miracle Open Voice</Typography>
          <Typography variant="h6" color="inherit" sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
            Text To Speech
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Paper sx={{ width: "60%", p: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Box
              {...getRootProps()}
              sx={{
                width: "100%",
                height: 100,
                border: "2px dashed gray",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                mb: 3,
                bgcolor: isDragActive ? "primary.light" : "background.default",
              }}
            >
              <input {...getInputProps()} />
              <Typography>{isDragActive ? "Drop the file here..." : "Drag and drop a .txt file here"}</Typography>
            </Box>

            <TextField
              multiline
              rows={4}
              fullWidth
              label="Enter text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              variant="outlined"
              sx={{ mb: 3 }}
            />

            <Select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} displayEmpty fullWidth sx={{ mb: 3 }}>
              {languages.map((lang) => <MenuItem key={lang.code} value={lang.code}>{lang.name}</MenuItem>)}
            </Select>

            <Button variant="contained" onClick={handleSpeech} fullWidth sx={{ mb: 3 }}>Convert Text to Speech</Button>
            <Button variant="outlined" onClick={handleStopSpeech} fullWidth>Stop</Button>

            <audio ref={audioRef} controls style={{ marginTop: 10, width: "100%" }} />
          </Paper>
        </Box>
      </Box>

      {/* Snackbar for alerts */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={4000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setAlertOpen(false)} severity="warning" sx={{ width: "100%" }}>
          {alertMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TextSpeech;
