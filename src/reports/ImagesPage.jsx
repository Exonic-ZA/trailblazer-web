import React, { useState } from 'react';
import {
  Table, TableRow, TableCell, TableHead, TableBody,
  TextField, Container, Box, FormControl, Link,
  Dialog, DialogContent, DialogTitle, TablePagination, Button
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/images?all=true');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
        getDevices();
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  }, [timestamp]);

  const getImageUrl = (id, fileName, fileExtension) => {
    return `/api/uploads/${id}/${fileName}.${fileExtension}`;
  };

  const getDevices = async () => {
    try {
      const query = new URLSearchParams({ all: showAll });
      const response = await fetch(`/api/devices?${query.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setDevices(data);
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  };

  const getDeviceDetails = (deviceId) => {
    const device = devices.find((it) => it.id === deviceId);
    return device ? { uniqueId: device.uniqueId, name: device.name } : { uniqueId: '', name: '' };
  };

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
    const deviceDetails = getDeviceDetails(item.deviceId);
    return (
      deviceDetails.uniqueId.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      deviceDetails.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  });

  const handleDialogOpen = (imageUrl) => {
    setDialogImage(imageUrl);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogImage('');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < Math.ceil(filteredItems.length / rowsPerPage) - 1) {
      setPage(page + 1);
    }
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
            <TableCell>{t('imageDeviceName')}</TableCell>
            <TableCell>{t('imageDeviceIdentifier')}</TableCell>
            <TableCell>{t('imageTimestamp')}</TableCell>
            <TableCell>{t('imageAddress')}</TableCell>
            <TableCell>{t('imagePreview')}</TableCell>
            <TableCell className={classes.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{getDeviceDetails(item.deviceId).name}</TableCell>
              <TableCell>{getDeviceDetails(item.deviceId).uniqueId}</TableCell>
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
              <TableCell />
            </TableRow>
          )) : (<TableShimmer columns={5} endAction />)}
        </TableBody>
      </Table>
      <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
        <Button onClick={handlePreviousPage} disabled={page === 0}>
          Previous
        </Button>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <Button onClick={handleNextPage} disabled={page >= Math.ceil(filteredItems.length / rowsPerPage) - 1}>
          Next
        </Button>
      </Box>
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