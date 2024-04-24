import type { FC } from 'react';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { DialogActions } from '@mui/material';
import Button from '@mui/material/Button';

interface OnboardDocumentModalProps {
  onClose?: () => void;
  open?: boolean;
  htmlContent?: string;
  title?: string;
}

export const OnboardDocumentModal: FC<OnboardDocumentModalProps> = (props) => {
  const { onClose, open = false, htmlContent, title } = props;

  return (
    <Dialog
      fullWidth
      maxWidth="md"
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
        <Typography variant="h6">{title || 'Untitled'}</Typography>
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
        <div dangerouslySetInnerHTML={{ __html: htmlContent || '' }} />
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button
          variant={'contained'}
          onClick={onClose}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};
