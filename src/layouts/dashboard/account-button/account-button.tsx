import type { FC } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { usePopover } from 'src/hooks/use-popover';

import { AccountPopover } from './account-popover';
import { useAuth } from 'src/hooks/use-auth';
import UserAvatar from '../../../components/user-avatar';

export const AccountButton: FC = () => {
  const { user } = useAuth();
  const popover = usePopover<HTMLButtonElement>();

  return (
    <>
      <Box
        component={ButtonBase}
        onClick={popover.handleOpen}
        ref={popover.anchorRef}
        sx={{
          alignItems: 'center',
          display: 'flex',
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: 'divider',
          height: 40,
          width: 40,
          borderRadius: '50%',
        }}
      >
        <UserAvatar
          userId={user?.id}
          height={32}
          width={32}
        />
      </Box>
      <AccountPopover
        anchorEl={popover.anchorRef.current}
        onClose={popover.handleClose}
        open={popover.open}
      />
    </>
  );
};
