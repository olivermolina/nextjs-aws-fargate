import * as React from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

export interface AccountCancelPlanModalProps {
  open: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  isLoading: boolean;
}

export default function AccountCancelPlanModal(props: AccountCancelPlanModalProps) {
  const { handleClose, open, handleConfirm, isLoading } = props;

  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
    >
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogContent dividers>
        <Typography> This will cancel your plan and you will no longer be able to use the service.
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
          onClick={handleConfirm}
          variant={'contained'}
          color={'error'}
          disabled={isLoading}
        >
          Confirm
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
