import * as React from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';

export interface Props {
  open: boolean;
  handleClose: () => void;
}

export default function AccountSchedulePullCalendarDialog(props: Props) {
  const { handleClose, open } = props;

  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
    >
      <DialogTitle>Pull from Google Calendar</DialogTitle>
      <DialogContent dividers>
        <Typography>
          Your google calendar is now syncing. To change this, please change your settings.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          variant={'contained'}
          color={'error'}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
