import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import * as React from 'react';

type DeleteSectionPromptProps = {
  open: boolean;
  sectionLabel: string;
  onClose?: () => void;
  onDelete?: () => void;
};

export default function DeleteSectionPrompt({
                                              open,
                                              sectionLabel,
                                              onClose,
                                              onDelete,
                                            }: DeleteSectionPromptProps) {
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
    >
      <DialogTitle>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          spacing={3}
        >
          <Typography variant="h6">
            Are you sure want to remove this {sectionLabel} section?
          </Typography>
          <IconButton
            color="inherit"
            onClick={onClose}
          >
            <SvgIcon>
              <XIcon />
            </SvgIcon>
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant={'body1'}>
          The section &quot;{sectionLabel}&quot; will be removed from the chart.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          sx={{
            width: 75,
          }}
          autoFocus
          onClick={onClose}
          variant={'outlined'}
        >
          Cancel
        </Button>
        <Button
          sx={{
            width: 75,
          }}
          onClick={() => {
            onDelete?.();
            onClose?.();
          }}
          variant={'contained'}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
