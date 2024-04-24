import type { FC } from 'react';
import PropTypes from 'prop-types';
import ChevronDownIcon from '@untitled-ui/icons-react/build/esm/ChevronDown';
import type { SxProps } from '@mui/system/styleFunctionSx';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

import { usePopover } from 'src/hooks/use-popover';

import { TenantPopover } from './tenant-popover';

const tenants: string[] = ['Devias', 'Acme Corp'];

interface TenantSwitchProps {
  sx?: SxProps;
}

export const TenantSwitch: FC<TenantSwitchProps> = (props) => {
  const popover = usePopover<HTMLButtonElement>();

  return (
    <>
      <Stack
        alignItems="center"
        direction="row"
        spacing={2}
        {...props}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            color="inherit"
            variant="h6"
          >
            Luna Health
          </Typography>
          <Typography
            color="neutral.400"
            variant="body2"
          >
            Production
          </Typography>
        </Box>

{/*
        <IconButton
          onClick={popover.handleOpen}
          ref={popover.anchorRef}
        >
          <SvgIcon sx={{ fontSize: 16 }}>
            <ChevronDownIcon />
          </SvgIcon>

        </IconButton>
*/}



      </Stack>

{/*
      <TenantPopover
        anchorEl={popover.anchorRef.current}
        onChange={popover.handleClose}
        onClose={popover.handleClose}
        open={popover.open}
        tenants={tenants}
      />
*/}


    </>
  );
};

TenantSwitch.propTypes = {
  // @ts-ignore
  sx: PropTypes.object,
};
