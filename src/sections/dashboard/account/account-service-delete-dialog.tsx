import * as React from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { ServiceWithStaff } from 'src/types/service';

export interface AccountServiceDeleteDialogProps {
  open: boolean;
  handleClose: () => void;
  handleDelete: () => void;
  isLoading: boolean;
  service: ServiceWithStaff;
}

export default function AccountServiceDeleteDialog(props: AccountServiceDeleteDialogProps) {
  const { handleClose, open, handleDelete, isLoading, service } = props;

  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
    >
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogContent dividers>
        <Typography>
          This is a permanent action. Once the <strong>&apos;{service?.name}&apos;</strong> service
          is deleted, you will no longer be able to access the service information.
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
          onClick={handleDelete}
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
