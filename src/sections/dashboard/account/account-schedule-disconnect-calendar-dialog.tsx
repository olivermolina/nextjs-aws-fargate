import * as React from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

export interface Props {
  open: boolean;
  handleClose: () => void;
  handleDisconnect: () => void;
  isLoading: boolean;
}

export default function AccountScheduleDisconnectCalendarDialog(props: Props) {
  const { handleClose, open, handleDisconnect, isLoading } = props;

  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
    >
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogContent dividers>
        <Typography>
          This will disconnect your google calendar from your account. You will no longer be able to
          sync your calendar.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={handleClose}
          variant={'outlined'}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDisconnect}
          variant={'contained'}
          color={'error'}
          disabled={isLoading}
        >
          Delete
          {isLoading && (
            <CircularProgress
              sx={{ ml: 1 }}
              size={20}
            />
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
