import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import React, { useMemo } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Popover from '@mui/material/Popover';

type TemplateTagsMenuProps = {
  anchorEl: HTMLElement | null;
  openTags: boolean;
  handleClose: () => void;
  handleToggle: (value: string) => () => void;
  watchTags?: string[];
  tags: string[];
  handleOpenManageTags: () => void;
  handleAddTag?: (tag: string) => void;
  addIsLoading?: boolean;
};

export default function TemplateTagsMenu(props: TemplateTagsMenuProps) {
  const {
    anchorEl,
    openTags,
    handleClose,
    tags,
    watchTags,
    handleToggle,
    handleOpenManageTags,
    handleAddTag,
    addIsLoading,
  } = props;

  const [searchKey, setSearchKey] = React.useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchKey(value);
  };
  const options = useMemo(() => {
    if (searchKey) {
      return tags.filter((tag) => tag.toLowerCase().includes(searchKey.toLowerCase()));
    }
    return tags;
  }, [tags, searchKey]);
  const isExist = useMemo(() => !(searchKey && tags.indexOf(searchKey) === -1), [tags, searchKey]);

  return (
    <Popover
      anchorEl={anchorEl}
      open={openTags}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      sx={{
        zIndex: 1500,
      }}
    >
      <Stack
        sx={{
          p: 2,
        }}
        spacing={1}
      >
        <Typography variant="caption">Tags</Typography>
        <TextField
          variant={'outlined'}
          placeholder={'Search tag'}
          label={null}
          onChange={handleSearchChange}
          InputProps={{
            endAdornment: searchKey && (
              <InputAdornment position="end">
                <Button
                  variant={'contained'}
                  size={'small'}
                  disabled={isExist || addIsLoading}
                  onClick={() => handleAddTag?.(searchKey)}
                >
                  Create new
                  {addIsLoading && (
                    <CircularProgress
                      sx={{ ml: 1 }}
                      size={10}
                    />
                  )}
                </Button>
              </InputAdornment>
            ),
          }}
          sx={{
            width: 400,
          }}
        />
        <List
          sx={{
            width: '100%',
            maxWidth: 360,
            bgcolor: 'background.paper',
            overflowY: 'auto', // Add vertical scrollbar when content overflows
            maxHeight: 200, // Set a maximum height for the list
          }}
        >
          {options.map((tag) => {
            const labelId = `checkbox-list-label-${tag}`;
            return (
              <ListItem
                key={tag}
                disablePadding
              >
                <ListItemButton
                  role={undefined}
                  onClick={handleToggle(tag)}
                  dense
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={watchTags?.indexOf(tag) !== -1}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ 'aria-labelledby': labelId }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    id={labelId}
                    primary={tag}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <Divider />
        <Button
          sx={{
            textAlign: 'left',
          }}
          onClick={handleOpenManageTags}
        >
          Manage tags
        </Button>
      </Stack>
    </Popover>
  );
}
