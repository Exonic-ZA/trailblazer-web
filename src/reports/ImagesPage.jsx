import React, { useState } from 'react';
import {
  Table, TableRow, TableCell, TableHead, TableBody,
  TextField, Container, Box, FormControl, Link,
  Dialog, DialogContent, DialogTitle, TablePagination, Button
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from '../reports/components/ReportsMenu';
import TableShimmer from '../common/components/TableShimmer';
import useReportStyles from '../reports/common/useReportStyles';
import usePersistedState from '../common/util/usePersistedState';
import ReportFilter from './components/ReportFilter';
import { useCatch } from '../reactHelper';

const ImagesPage = () => {
  const classes = useReportStyles();
  const t = useTranslation();

  const devices = useSelector((state) => state.devices.items);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogImage, setDialogImage] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSubmit = useCatch(async ({ deviceIds, groupIds, from, to }) => {
    const query = new URLSearchParams({ from, to });
    deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
    groupIds.forEach((groupId) => query.append('groupId', groupId));
    setLoading(true);
    try {
      const response = await fetch(`/api/images?${query.toString()}`);
      if (response.ok) {
        setItems(await response.json());
      } else {
        throw Error(await response.text());
      }
    } finally {
      setLoading(false);
    }
  });

  const getImageUrl = (id, fileName, fileExtension) => {
    return `/api/uploads/${id}/${fileName}.${fileExtension}`;
  };

  const getDeviceDetails = (deviceId) => {
    const device = devices[deviceId];
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

  const sortedItems = items.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

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
    if (page < Math.ceil(sortedItems.length / rowsPerPage) - 1) {
      setPage(page + 1);
    }
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'sharedimages']}>
      <div className={classes.header}>
        <ReportFilter handleSubmit={handleSubmit} multiDevice includeGroups>
        </ReportFilter>
      </div>
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
          {!loading ? sortedItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
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
          count={sortedItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <Button onClick={handleNextPage} disabled={page >= Math.ceil(sortedItems.length / rowsPerPage) - 1}>
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