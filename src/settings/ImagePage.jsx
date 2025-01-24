import React, { useState } from 'react';

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Button,
  TextField,
  Container,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation, useTranslationKeys } from '../common/components/LocalizationProvider';
import EditItemView from './components/EditItemView';
import { prefixString, unprefixString } from '../common/util/stringUtils';
import SelectField from '../common/components/SelectField';
import SettingsMenu from './components/SettingsMenu';
import { useCatch } from '../reactHelper';
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
  
    const imageUrl = 'https://www.google.com/logos/2024/moon/moon_january-r1/cta.png';
    const imageDescription = 'This is a placeholder image';
    
    const validate = () => item && item.type && item.notificators && (!item.notificators?.includes('command') || item.commandId);
  
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        setFileName(selectedFile.name);
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
          } else {
            console.error('Metadata upload failed:', await response.text());
          }
        } catch (error) {
          console.error('Error uploading metadata:', error);
        }
      };
    
      const handleFileUpload = async () => {
        if (!file || !imageId) return;
    
        const formData = new FormData();
        formData.append('file', file);
    
        try {
          const response = await fetch(`/api/images/${imageId}/upload`, {
            method: 'POST',
            body: formData,
          });
    
          if (response.ok) {
            const data = await response.json();
            console.log('File upload successful:', data);
            // Handle successful upload (e.g., update state, show notification, etc.)
          } else {
            console.error('File upload failed:', await response.text());
          }
        } catch (error) {
          console.error('Error uploading file:', error);
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
          <Button
            variant="contained"
            color="secondary"
            onClick={handleFileUpload}
            disabled={!file}
            style={{ marginTop: '16px' }}
          >
            Upload File
          </Button>
        )}
      </Box>
    </Container>
        </>
      )}
      </EditItemView>
    );
  };

export default ImagePage;