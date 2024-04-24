import React, { FC } from 'react';
import PropTypes from 'prop-types';
import Menu01Icon from '@untitled-ui/icons-react/build/esm/Menu01';
import { alpha } from '@mui/system/colorManipulator';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';

import { AccountButton } from '../account-button';
import { LanguageSwitch } from '../language-switch';
import { LimitedAppAccessAlert, VerifyAlert } from '../layout';
import { NotificationsButton } from '../notifications-button';
import SearchInput from '../search-button/search-input';
import Toolbar from '@mui/material/Toolbar';
import CustomerProfileAppointmentRequest
  from '../../../sections/dashboard/customer/customer-profile-appointment-request';

const TOP_NAV_HEIGHT = 64;
const SIDE_NAV_WIDTH = 200;

interface TopNavProps {
  onMobileNavOpen?: () => void;
  open?: boolean;
}

export const TopNav: FC<TopNavProps> = (props) => {
  const { onMobileNavOpen, ...other } = props;
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  return (
    <Box
      component="header"
      sx={ theme => ({
        backdropFilter: 'blur(6px)',
        backgroundColor: (theme) => alpha(theme.palette.background.default, 0.8),
        position: 'sticky',
        left: {
          lg: props.open ? `${SIDE_NAV_WIDTH}px` : `calc(${theme.spacing(2)} + 1px)`,
          xl: props.open ? `${SIDE_NAV_WIDTH}px` : `calc(${theme.spacing(8)} + 1px)`
        },
        top: 0,
        width: {
          lg:  props.open ? `calc(100% - ${SIDE_NAV_WIDTH}px)` : `calc(100% - ${theme.spacing(2)} + 1px)`,
          xl:  props.open ? `calc(100% - ${SIDE_NAV_WIDTH}px)` : `calc(100% - ${theme.spacing(8)} + 1px)`,
        },
        zIndex: (theme) => theme.zIndex.appBar,
      })}
      {...other}
    >
      <VerifyAlert />
      <LimitedAppAccessAlert />
      <CustomerProfileAppointmentRequest
        showMarkAsRead
        sxCardProps={{
          width: 'auto',
          backgroundColor: 'warning.light',
          borderRadius: 0,
          p: 0,
        }}
        buttonsFullWidth={false}
      />
      <Toolbar
        sx={{
          minHeight: TOP_NAV_HEIGHT,
          px: 2,
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            width: '100%',
          }}
        >
          {!lgUp ? (
            <Stack
              direction={'row'}
              sx={{
                width: '100%',
              }}
            >
              <IconButton onClick={onMobileNavOpen}>
                <SvgIcon>
                  <Menu01Icon />
                </SvgIcon>
              </IconButton>

              <SearchInput />
            </Stack>
          ) : (
            <SearchInput />
          )}
        </Box>

        <Box>
          <Stack
            alignItems="center"
            direction="row"
            spacing={2}
          >
            <LanguageSwitch />
            <NotificationsButton />
            {/* <ContactsButton /> */}
            <AccountButton />
          </Stack>
        </Box>
      </Toolbar>
    </Box>
  );
};

TopNav.propTypes = {
  onMobileNavOpen: PropTypes.func,
};
