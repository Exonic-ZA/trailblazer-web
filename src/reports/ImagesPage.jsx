import { useMemo, useState } from 'react';
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Box,
  Link,
  Dialog,
  DialogContent,
  DialogTitle,
  TablePagination,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useCatchCallback } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';
import TableShimmer from '../common/components/TableShimmer';
import useReportStyles from './common/useReportStyles';
import ReportFilter from './components/ReportFilter';
import fetchOrThrow from '../common/util/fetchOrThrow';
import { formatTime } from '../common/util/formatter';

const getImageUrl = (item) => `/api/uploads/${item.id}/${item.fileName}.${item.fileExtension}`;

const ImagesPage = () => {
  const { classes } = useReportStyles();
  const t = useTranslation();

  const devices = useSelector((state) => state.devices.items);
  const groups = useSelector((state) => state.groups.items);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogImage, setDialogImage] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const onShow = useCatchCallback(
    async ({ deviceIds, groupIds, from, to }) => {
      setLoading(true);
      try {
        const query = new URLSearchParams({ from, to });
        deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
        groupIds.forEach((groupId) => query.append('groupId', groupId));
        const response = await fetchOrThrow(`/api/images?${query.toString()}`);
        setItems(await response.json());
        setPage(0);
      } finally {
        setLoading(false);
      }
    },
    [setItems, setLoading, setPage],
  );

  // The server orders newest first, but sort defensively so the page does not
  // depend on that. Copy first: `items` is state and must not be mutated.
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)),
    [items],
  );

  const visibleItems = useMemo(
    () => sortedItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedItems, page, rowsPerPage],
  );

  const deviceDetails = (deviceId) => {
    const device = devices[deviceId];
    if (!device) {
      return { uniqueId: '', name: '', groupName: '' };
    }
    const group = device.groupId ? groups[device.groupId] : null;
    return {
      uniqueId: device.uniqueId,
      name: device.name,
      groupName: group ? group.name : '',
    };
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'imagesTitle']}>
      <div className={classes.container}>
        <div className={classes.containerMain}>
          <div className={classes.header}>
            <ReportFilter onShow={onShow} deviceType="multiple" loading={loading} />
          </div>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('imageID')}</TableCell>
                <TableCell>{t('imageDeviceName')}</TableCell>
                <TableCell>{t('imageGroupName')}</TableCell>
                <TableCell>{t('imageDeviceIdentifier')}</TableCell>
                <TableCell>{t('imageTimestamp')}</TableCell>
                <TableCell>{t('imageAddress')}</TableCell>
                <TableCell>{t('imagePreview')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? (
                visibleItems.map((item) => {
                  const device = deviceDetails(item.deviceId);
                  const url = getImageUrl(item);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{device.name}</TableCell>
                      <TableCell>{device.groupName}</TableCell>
                      <TableCell>{device.uniqueId}</TableCell>
                      <TableCell>{formatTime(item.uploadedAt, 'seconds')}</TableCell>
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
                        <Box
                          component="img"
                          src={url}
                          alt={`${t('imagePreview')} ${item.id}`}
                          width="100"
                          loading="lazy"
                          sx={{ cursor: 'pointer', display: 'block' }}
                          onClick={() => setDialogImage(url)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableShimmer columns={7} />
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={sortedItems.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </div>
      </div>
      <Dialog
        open={Boolean(dialogImage)}
        onClose={() => setDialogImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t('imagePreview')}</DialogTitle>
        <DialogContent>
          <Box
            component="img"
            src={dialogImage}
            alt={t('imagePreview')}
            sx={{ width: '100%', display: 'block' }}
          />
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default ImagesPage;
