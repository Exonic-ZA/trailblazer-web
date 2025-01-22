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

const images = [
  {
    title: 'Image 1',
    description: 'This is the first image',
    url: 'https://via.placeholder.com/150',
  },
  {
    title: 'Image 2',
    description: 'This is the second image',
    url: 'https://via.placeholder.com/150',
  },
  {
    title: 'Image 3',
    description: 'This is the third image',
    url: 'https://via.placeholder.com/150',
  },
];

const ImagesPage = () => {
    const classes = useSettingsStyles();
    const t = useTranslation();
  
    const [timestamp, setTimestamp] = useState(Date.now());
    const [items, setItems] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [loading, setLoading] = useState(false);

    const [device, setDevice] = useState('');
    const [period, setPeriod] = useState('');
    const [eventType, setEventType] = useState('');
    const [column, setColumn] = useState('');

    const handleDeviceChange = (event) => {
        setDevice(event.target.value);
    };

    const handlePeriodChange = (event) => {
        setPeriod(event.target.value);
    };

    const handleEventTypeChange = (event) => {
        setEventType(event.target.value);
    };

    const handleColumnChange = (event) => {
        setColumn(event.target.value);
    };
    
    // useEffectAsync(async () => {
    //   setLoading(true);
    //   try {
    //     const response = await fetch('/api/images');
    //     if (response.ok) {
    //       setItems(await response.json());
    //     } else {
    //       throw Error(await response.text());
    //     }
    //   } finally {
    //     setLoading(false);
    //   }
    // }, [timestamp]);
  
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
                <Box mx={0.5} my={1}>
                <FormControl variant="outlined" sx={{ minWidth: 200 }} fullWidth>
                    <InputLabel id="device-label">Device</InputLabel>
                    <Select
                    labelId="device-label"
                    id="device-select"
                    value={device}
                    onChange={handleDeviceChange}
                    label="Device"
                    >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value="device1">Device 1</MenuItem>
                    <MenuItem value="device2">Device 2</MenuItem>
                    <MenuItem value="device3">Device 3</MenuItem>
                    </Select>
                </FormControl>
                </Box>
                <Box mx={0.5} my={1}>
                <FormControl variant="outlined" sx={{ minWidth: 200 }} fullWidth>
                    <InputLabel id="period-label">Period</InputLabel>
                    <Select
                    labelId="period-label"
                    id="period-select"
                    value={period}
                    onChange={handlePeriodChange}
                    label="Period"
                    >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value="period1">Period 1</MenuItem>
                    <MenuItem value="period2">Period 2</MenuItem>
                    <MenuItem value="period3">Period 3</MenuItem>
                    </Select>
                </FormControl>
                </Box>
                <Box mx={0.5} my={1}>
                <FormControl variant="outlined" sx={{ minWidth: 200 }} fullWidth>
                    <InputLabel id="event-type-label">Event Type</InputLabel>
                    <Select
                    labelId="event-type-label"
                    id="event-type-select"
                    value={eventType}
                    onChange={handleEventTypeChange}
                    label="Event Type"
                    >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value="event1">Event 1</MenuItem>
                    <MenuItem value="event2">Event 2</MenuItem>
                    <MenuItem value="event3">Event 3</MenuItem>
                    </Select>
                </FormControl>
                </Box>
                <Box mx={0.5} my={1}>
                <FormControl variant="outlined" sx={{ minWidth: 200 }} fullWidth>
                    <InputLabel id="column-label">Column</InputLabel>
                    <Select
                    labelId="column-label"
                    id="column-select"
                    value={column}
                    onChange={handleColumnChange}
                    label="Column"
                    >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value="column1">Column 1</MenuItem>
                    <MenuItem value="column2">Column 2</MenuItem>
                    <MenuItem value="column3">Column 3</MenuItem>
                    </Select>
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
            {!loading ? items.filter(filterByKeyword(searchKeyword)).map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
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