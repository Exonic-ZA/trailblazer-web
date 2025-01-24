import React, { useState } from 'react';
import {
  Container, Box, TextField, Button, Typography,
} from '@mui/material';
import { DropzoneArea } from 'react-mui-dropzone';
import { useTranslation } from '../common/components/LocalizationProvider';
import EditItemView from './components/EditItemView';
import SettingsMenu from './components/SettingsMenu';
import useSettingsStyles from './common/useSettingsStyles';

const ImagePage = () => {
  const classes = useSettingsStyles();
  const t = useTranslation();

  const [item, setItem] = useState();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileExtension, setFileExtension] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [imageId, setImageId] = useState(null);
  const [error, setError] = useState('');

  const validate = () => item && item.type && item.notificators && (!item.notificators?.includes('command') || item.commandId);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    const nameWithoutExtension = selectedFile.name.split('.').slice(0, -1).join('.');
    setFileName(nameWithoutExtension);
    setFileExtension(selectedFile.name.split('.').pop());
  };

  const handleMetadataUpload = async () => {
    const metadata = {
      fileName,
      fileExtension,
      deviceId,
      latitude,
      longitude,
    };

    try {
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      if (response.ok) {
        const data = await response.json();
        setImageId(data.id);
        console.log('Metadata upload successful:', data);
        setError(''); // Clear any previous errors
      } else {
        const errorMessage = await response.text();
        console.error('Metadata upload failed:', errorMessage);
        setError(`Metadata upload failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error uploading metadata:', error);
      setError(`Error uploading metadata: ${error.message}`);
    }
  };

  const handleFileUpload = async (files) => {
    if (!files.length || !imageId) return;

    const selectedFile = files[0];
    console.log('Uploading new file:', selectedFile, imageId, fileExtension);

    try {
      const response = await fetch(`/api/images/${imageId}/upload`, {
        method: 'POST',
        body: selectedFile,
      });

      if (response.ok) {
        console.log('File upload successful:', await response.text());
        setError(''); // Clear any previous errors
      } else {
        const errorMessage = await response.text();
        console.error('File upload failed:', errorMessage);
        setError(`File upload failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(`Error uploading file: ${error.message}`);
    }
  };

  return (
    <EditItemView
      endpoint="images"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedImage']}
    >
      {item && (
        <>
          <Container>
            <Box display="flex" flexDirection="column" alignItems="center" my={4}>
              <TextField
                type="file"
                onChange={handleFileChange}
                variant="outlined"
                margin="normal"
              />
              <TextField
                label="Device ID"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                variant="outlined"
                margin="normal"
              />
              <TextField
                label="Latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                variant="outlined"
                margin="normal"
              />
              <TextField
                label="Longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                variant="outlined"
                margin="normal"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleMetadataUpload}
                disabled={!fileName || !fileExtension || !deviceId || !latitude || !longitude}
              >
                Upload Metadata
              </Button>
              {imageId && (
                <DropzoneArea
                  dropzoneText="Drag and drop an image here or click"
                  acceptedFiles={['image/*']}
                  filesLimit={1}
                  onChange={handleFileUpload}
                  showAlerts={false}
                  maxFileSize={500000}
                />
              )}
              {error && (
                <Typography color="error" variant="body2" style={{ marginTop: '16px' }}>
                  {error}
                </Typography>
              )}
            </Box>
          </Container>
        </>
      )}
    </EditItemView>
  );
};

export default ImagePage;