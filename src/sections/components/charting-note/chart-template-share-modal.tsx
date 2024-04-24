import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Stack from '@mui/material/Stack';
import React from 'react';
import DialogContent from '@mui/material/DialogContent';
import { DialogActions } from '@mui/material';
import Button from '@mui/material/Button';

type ChartTemplateShareModalProps = {
  templateId: string;
  open: boolean;
  handleClose: () => void;
  handleShare: (templateId: string) => void;
};

export default function ChartTemplateShareModal({
                                                  templateId,
                                                  open,
                                                  handleClose,
                                                  handleShare,
                                                }: ChartTemplateShareModalProps) {
  return (
    <Dialog open={open}>
      <Stack
        alignItems="center"
        direction="row"
        spacing={1}
        sx={{
          px: 2,
          py: 1,
        }}
      >
        <Typography
          sx={{ flexGrow: 1 }}
          variant="h6"
        >
          Template Saved!
        </Typography>
        <IconButton onClick={handleClose}>
          <SvgIcon>
            <XIcon />
          </SvgIcon>
        </IconButton>
      </Stack>
      <DialogContent dividers>
        Do you want to also share this with the rest of your organization?
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={handleClose}
          variant={'outlined'}
        >
          No thanks
        </Button>
        <Button
          onClick={() => handleShare(templateId)}
          variant={'contained'}
        >
          Yes, please share
        </Button>
      </DialogActions>
    </Dialog>
  );
}
