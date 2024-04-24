import * as React from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import { useDispatch, useSelector } from 'src/store';
import { slice } from 'src/slices/app';


export default function AppAccessBlockModal() {
  const dispatch = useDispatch();
  const showBlockMessage = useSelector((state) => state.app.showBlockMessage);
  const close = () => dispatch(slice.actions.setShowBlockMessage(false));
  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
      open={showBlockMessage}
    >
      <DialogTitle>Access to the app is limited</DialogTitle>
      <DialogContent>
        <Typography> Please pay your bill to continue using the app.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={close}
          variant={'outlined'}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
