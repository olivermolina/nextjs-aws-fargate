import React, { FC, useMemo } from 'react';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { DialogActions } from '@mui/material';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ArrowLeftIcon from '@untitled-ui/icons-react/build/esm/ArrowLeft';
import ListItemText from '@mui/material/ListItemText';
import DeleteIcon from '@mui/icons-material/Delete';

interface TemplateDeleteModalProps {
  onClose?: () => void;
  open?: boolean;
  handleSubmit?: (tags: string[]) => void;
  isSubmitting?: boolean;
  tags: string[];
}

export const TemplateManageTags: FC<TemplateDeleteModalProps> = (props) => {
  const { onClose, open = false, handleSubmit, isSubmitting, tags } = props;
  const [deletedTags, setDeletedTags] = React.useState<string[]>([]);

  const options = useMemo(
    () => tags.filter((tag) => tag !== 'Intake' && !deletedTags.includes(tag)),
    [deletedTags, tags],
  );
  const handleAddDeletedTag = (tag: string) => {
    setDeletedTags([...deletedTags, tag]);
  };

  const closeDialog = () => {
    onClose?.();
    setDeletedTags([]);
  };

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      onClose={closeDialog}
      open={open}
      sx={{
        zIndex: 1600,
      }}
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={3}
        sx={{
          px: 3,
          py: 2,
        }}
      >
        <IconButton
          color="inherit"
          onClick={closeDialog}
        >
          <SvgIcon>
            <ArrowLeftIcon />
          </SvgIcon>
        </IconButton>
        <Typography variant="h5">Manage tags</Typography>
        <IconButton
          color="inherit"
          onClick={closeDialog}
        >
          <SvgIcon>
            <XIcon />
          </SvgIcon>
        </IconButton>
      </Stack>
      <DialogContent>
        {options.length === 0 && (
          <Typography
            color="text.secondary"
            sx={{ mt: 1, textAlign: 'center' }}
            variant="subtitle1"
          >
            No tags
          </Typography>
        )}

        {options.map((tag) => {
          const labelId = `checkbox-list-label-${tag}`;
          return (
            <ListItem
              key={tag}
              disablePadding
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleAddDeletedTag(tag)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemButton
                role={undefined}
                dense
              >
                <ListItemText
                  id={labelId}
                  primary={tag}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: 'center',
        }}
      >
        <Button
          variant="contained"
          disabled={isSubmitting}
          onClick={() => handleSubmit?.(deletedTags)}
        >
          Save
          {isSubmitting && (
            <CircularProgress
              sx={{ ml: 1 }}
              size={20}
            />
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
