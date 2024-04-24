import type { FC } from 'react';
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

interface TemplateDeleteModalProps {
  onClose?: () => void;
  open?: boolean;
  handleSubmit: () => void;
  isSubmitting?: boolean;
}

export const TemplateDeleteModal: FC<TemplateDeleteModalProps> = (props) => {
  const { onClose, open = false, handleSubmit, isSubmitting } = props;

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={open}
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
        <Typography variant="h6">Are you sure you want to delete this template?</Typography>
        <IconButton
          color="inherit"
          onClick={onClose}
        >
          <SvgIcon>
            <XIcon />
          </SvgIcon>
        </IconButton>
      </Stack>
      <DialogContent>
        <Typography variant={'subtitle1'}>This action cannot be undone</Typography>
      </DialogContent>
      <DialogActions>
        <Button
          variant={'outlined'}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={isSubmitting}
          onClick={handleSubmit}
          color={'error'}
        >
          Delete
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
