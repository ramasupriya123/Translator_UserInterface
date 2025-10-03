import axios from 'axios';
import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function TextTranslation() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en'); // default source language
  const [targetLanguage, setTargetLanguage] = useState('id'); // default target language
  // const [sourceFile, setSourceFile] = useState(null);



const translatorKey = process.env.REACT_APP_AZURE_TEXT_KEY;
const translatorRegion = process.env.REACT_APP_TRANSLATOR_REGION;
const translatorEndpoint = process.env.REACT_APP_TRANSLATOR_ENDPOINT;

  // Handle file upload and read file content
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    // setSourceFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setInputText(e.target.result);
    reader.readAsText(file);
  };

  // Translate text using Azure Translator
  const translateText = async () => {
    if (!inputText) {
      setTranslatedText("Please enter text to translate.");
      return;
    }

    try {
      const url = `${translatorEndpoint}translate?api-version=3.0&from=${sourceLanguage}&to=${targetLanguage}`;

      const response = await axios.post(
        url,
        [{ Text: inputText }],
        {
          headers: {
            "Ocp-Apim-Subscription-Key": translatorKey,
            "Ocp-Apim-Subscription-Region": translatorRegion,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data);
      if (response.data && response.data[0] && response.data[0].translations) {
        setTranslatedText(response.data[0].translations[0].text);
      } else {
        setTranslatedText("Translation not found.");
      }
    } catch (error) {
      console.error('Error translating text:', error);
      setTranslatedText("Error occurred during translation.");
    }
  };

  // Handle download of translated text
  const handleDownload = () => {
    const blob = new Blob([translatedText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'translated_text.txt';
    link.click();
  };

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'hi', label: 'Hindi' },
    { value: 'te', label: 'Telugu' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ru', label: 'Russian' },
    { value: 'ar', label: 'Arabic' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'es', label: 'Spanish' },
    { value: 'id', label: 'Indonesian' }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography variant="h6" color="inherit" component="div">
            Miracle Open-Voice
          </Typography>
          <Typography variant="h6" color="inherit" component="div" sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            Text To Text
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ padding: 3 }}>
        <Grid container spacing={4} alignItems="center" margin left="50">
          {/* Source Language Selection and Input Text */}
          <Grid item xs={5}>
            <TextField
              select
              label="Detect Language"
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              sx={{ marginBottom: 2, width: '50%' }}
            >
              {languageOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <Button variant="contained" component="label" sx={{ marginLeft: 1, marginBottom: 1, width: '30%' }}>
              Upload File
              <input type="file" hidden onChange={handleFileUpload} />
            </Button>

            <TextField
              label="Enter text to translate"
              multiline
              rows={10}
              variant="outlined"
              fullWidth
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </Grid>

          {/* Arrow icon in the middle */}
          <Grid item xs={1} container alignItems="center" justifyContent="center">
            <ArrowForwardIcon sx={{ fontSize: 40 }} />
          </Grid>

          {/* Target Language Selection and Translated Text */}
          <Grid item xs={5}>
            <TextField
              select
              label="Target Language"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              sx={{ marginBottom: 2, width: '50%' }}
            >
              {languageOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Translated text"
              multiline
              rows={10}
              variant="outlined"
              fullWidth
              value={translatedText}
              InputProps={{
                readOnly: true,
              }}
            />

            <Button
              variant="contained"
              color="secondary"
              onClick={handleDownload}
              sx={{ marginTop: 2 }}
              fullWidth
            >
              Download Translated Text
            </Button>
          </Grid>
        </Grid>

        {/* Translate Button */}
        <Grid container justifyContent="center" sx={{ marginTop: 4 }}>
          <Grid item xs={4}>
            <Button variant="contained" color="primary" onClick={translateText} fullWidth>
              Translate
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default TextTranslation;
