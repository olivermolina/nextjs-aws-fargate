import { trpc } from '../../../app/_trpc/client';
import Dialog from '@mui/material/Dialog';
import React from 'react';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import CloseIcon from '@untitled-ui/icons-react/build/esm/XClose';

type FaxPdfViewerProps = {
  sFaxDetailsID: string;
  sDirection: 'IN' | 'OUT';
  handleClose?: () => void;
  open: boolean;
};

export default function FaxPdfViewer({
                                       sFaxDetailsID,
                                       sDirection,
                                       handleClose,
                                       open,
                                     }: FaxPdfViewerProps) {
  const { data, isLoading } = trpc.fax.retrieveFaxPdf.useQuery(
    {
      sFaxDetailsID,
      sDirection,
    },
    {
      enabled: open,
    },
  );
  return (
    <Dialog
      open={open}
      fullScreen
      onClose={handleClose}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 1,
        }}
      >
        <Typography
          sx={{
            flexGrow: 1,
          }}
          variant={'h6'}
        >
          Fax PDF Viewer
        </Typography>

        <IconButton onClick={handleClose}>
          <SvgIcon>
            <CloseIcon />
          </SvgIcon>
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          overflow: 'hidden',
        }}
      >
        {isLoading ? (
          'Loading Fax...'
        ) : (
          <iframe
            src={`data:application/pdf;base64,${data}`}
            width="100%"
            height="100%"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
