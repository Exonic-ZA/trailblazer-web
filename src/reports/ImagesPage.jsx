import React, { useState} from 'react';
import {
  Table, TableRow, TableCell, TableHead, TableBody,
  TextField, Container, Box, FormControl, Link,
  Dialog, DialogContent, DialogTitle
} from '@mui/material';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from '../reports/components/ReportsMenu';
import TableShimmer from '../common/components/TableShimmer';
import useReportStyles from '../reports/common/useReportStyles';
import usePersistedState from '../common/util/usePersistedState';

const ImagesPage = () => {
    const classes = useReportStyles();
    const t = useTranslation();
  
    const [timestamp, setTimestamp] = useState(Date.now());
    const [items, setItems] = useState([]);
    const [devices, setDevices] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [showAll, setShowAll] = usePersistedState('showAllDevices', false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogImage, setDialogImage] = useState('');
    
    useEffectAsync(async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/images');
          if (response.ok) {
            const data = await response.json();
            console.log('API response:', data);
            setItems(data);
            getDevices();
          } else {
            throw Error(await response.text());
          }
        } finally {
          setLoading(false);
        }
      }, [timestamp]);

      const getImageUrl = async (id, fileName, fileExtension) => {
        try {
          const response = await fetch(`/api/uploads/${id}/${fileName}.${fileExtension}`, {
            method: 'GET',
          });
          if (response.ok) {
            const data = await response.json();
            setImageUrl(data.url);
            console.log("image url:", imageUrl);
          } else {
            throw new Error(`Failed to fetch image: ${await response.text()}`);
          }
        } catch (error) {
          console.error('Error fetching image URL:', error);
        }
      };

      // Get list of devices from server
    const getDevices = async () => {
        try {
          const query = new URLSearchParams({ all: showAll });
          const response = await fetch(`/api/devices?${query.toString()}`);
          if (response.ok) {
            const data = await response.json();
            console.log('API responsen devices:', data);
            setDevices(data);
          } else {
            throw Error(await response.text());
          }
        }
        finally {
          setLoading(false);
        }
      };
      
      const getUniqueIdentifier = (deviceId) => {
        const device = devices.find((it) => it.id === deviceId);
        return device ? device.uniqueId : '';
      }

      const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        const ss = String(date.getSeconds()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
      };
  
      const handleSearchChange = (event) => {
        setSearchKeyword(event.target.value);
      };

      const filteredItems = items.filter((item) => {
        const uniqueId = getUniqueIdentifier(item.deviceId);
        return uniqueId.toLowerCase().includes(searchKeyword.toLowerCase());
      });

      const handleDialogOpen = (imageUrl) => {
        setDialogImage(imageUrl);
        setDialogOpen(true);
      };
    
      const handleDialogClose = () => {
        setDialogOpen(false);
        setDialogImage('');
      };
  
    return (
      <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'sharedimages']}>
        
        <Container>
        <Box display="flex" justifyContent="flex-start" flexWrap="wrap" my={2}>
        <Box mx={0.5} my={1}>
          <FormControl variant="outlined" sx={{ minWidth: 200 }} fullWidth>
            <TextField
              id="device-search"
              label="Search Device"
              variant="outlined"
              value={searchKeyword}
              onChange={handleSearchChange}
              fullWidth
            />
          </FormControl>
        </Box>
      </Box>
        </Container>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>{t('imageID')}</TableCell>
              <TableCell>{t('imageDevice')}</TableCell>
              <TableCell>{t('imageTimestamp')}</TableCell>
              <TableCell>{t('imageAddress')}</TableCell>
              <TableCell>{t('imagePreview')}</TableCell>
              <TableCell className={classes.columnAction} />
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading ? filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{getUniqueIdentifier(item.deviceId)}</TableCell>
                <TableCell>{formatTimestamp(item.uploadedAt)}</TableCell>
                <TableCell>
                  <Link
                    href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {`${item.latitude}, ${item.longitude}`}
                  </Link>
                </TableCell>
                <TableCell>
                  <img
                    src={`${getImageUrl(item.id, item.fileName, item.fileExtension)}`}
                    alt={`Image ${item.id}`}
                    width="100"
                    onClick={() => handleDialogOpen(`${getImageUrl(item.id, item.fileName, item.fileExtension)}`)}
                    style={{ cursor: 'pointer' }}
                  />
                </TableCell>
                <TableCell >
                </TableCell>
              </TableRow>
            )) : (<TableShimmer columns={5} endAction />)}
          </TableBody>
        </Table>
        <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Image View</DialogTitle>
        <DialogContent>
          <img src={dialogImage} alt="Large Preview" style={{ width: '100%' }} />
        </DialogContent>
      </Dialog>
      </PageLayout>
    );
  };

export default ImagesPage;