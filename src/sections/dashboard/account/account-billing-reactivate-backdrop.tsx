import React from 'react';
import { Backdrop } from '@mui/material';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import PulseLoader from "react-spinners/PulseLoader";

interface Props {
  message: string;
  open: boolean;
}

const BackdropLoading = ({ message, open }: Props) => {
  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: 12000 }}
      open={open}
      data-testid="backdrop-loading"
    >
      <Stack direction={'column'} spacing={1} justifyContent={'center'} alignItems={'center'}>

        <Typography variant={'h6'}>
          {message}
        </Typography>
        <PulseLoader
          color={'#fff'}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </Stack>
    </Backdrop>
  );
};

export default BackdropLoading;
