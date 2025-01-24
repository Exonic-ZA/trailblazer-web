import React, { useState } from 'react';
import {
  Table, TableRow, TableCell, TableHead, TableBody,
  TextField, Container, Box, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { useEffectAsync } from '../reactHelper';
import { prefixString } from '../common/util/stringUtils';
import { formatBoolean } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import useSettingsStyles from './common/useSettingsStyles';

const ImagesPage = () => {
    const classes = useSettingsStyles();
    const t = useTranslation();
  
    const [timestamp, setTimestamp] = useState(Date.now());
    const [items, setItems] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [loading, setLoading] = useState(false);

    const [device, setDevice] = useState('');

    const handleDeviceChange = (event) => {
        setDevice(event.target.value);
    };
    
    useEffectAsync(async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/images');
          if (response.ok) {
            const data = await response.json();
            console.log('API response:', data);
            setItems(data);
          } else {
            throw Error(await response.text());
          }
        } finally {
          setLoading(false);
        }
      }, [timestamp]);

      // Get list of devices from server
      // Display the device unique identifier to the user
      // When the user selects a device, it uses the device id connected to it to filter by that device
      // Also display the device identifier in place of the device id on the image list
  
    const formatList = (prefix, value) => {
      if (value) {
        return value
          .split(/[, ]+/)
          .filter(Boolean)
          .map((it) => t(prefixString(prefix, it)))
          .join(', ');
      }
      return '';
    };
  
    return (
      <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'sharedimages']}>
        <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
        
        <Container>
        <Box display="flex" justifyContent="space-around" flexWrap="wrap" my={2}>
        {/* <Box mx={0.5} my={1}>
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
        </Box> */}
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
            {!loading ? items.filter(filterByKeyword(searchKeyword)).map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{t(prefixString('event', item.type))}</TableCell>
                <TableCell>{formatBoolean(item.always, t)}</TableCell>
                <TableCell>{formatList('alarm', item.attributes.alarms)}</TableCell>
                <TableCell>{formatList('notificator', item.notificators)}</TableCell>
                <TableCell className={classes.columnAction} padding="none">
                  <CollectionActions itemId={item.id} editPath="/settings/image" endpoint="images" setTimestamp={setTimestamp} />
                </TableCell>
              </TableRow>
            )) : (<TableShimmer columns={5} endAction />)}
          </TableBody>
        </Table>
        <CollectionFab editPath="/settings/image" />
      </PageLayout>
    );
  };

export default ImagesPage;