import React, { FC, ReactNode, useCallback } from 'react';
import PropTypes from 'prop-types';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';
import { styled } from '@mui/material/styles';

import type { NavColor } from 'src/types/settings';

import type { Section } from '../config';
import { MobileNav } from '../mobile-nav';
import { SideNav, useCssVars } from './side-nav';
import { TopNav } from './top-nav';
import { useMobileNav } from './use-mobile-nav';
import AppAccessBlockModal from '../../../sections/dashboard/app-access/app-access-block-modal';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import ChevronLeftIcon from '@untitled-ui/icons-react/build/esm/ChevronLeft';
import ChevronRightIcon from '@untitled-ui/icons-react/build/esm/ChevronRight';
import { alpha } from '@mui/system/colorManipulator';
import { useDispatch, useSelector } from '../../../store';
import { slice } from '../../../slices/app';

const SIDE_NAV_WIDTH = 200;
type DivProps = {
  open: boolean;
};

const VerticalLayoutRoot = styled('div')<DivProps>(({ theme, open }) => ({
  display: 'flex',
  flex: '1 1 auto',
  maxWidth: '100%',
  [theme.breakpoints.up('xl')]: {
    paddingLeft: open ? SIDE_NAV_WIDTH : `calc(${theme.spacing(2)} + 1px)`,
  },
  [theme.breakpoints.up('lg')]: {
    paddingLeft: open ? SIDE_NAV_WIDTH : `calc(${theme.spacing(8)} + 1px)`,
  },
}));

const VerticalLayoutContainer = styled('div')({
  display: 'flex',
  flex: '1 1 auto',
  flexDirection: 'column',
  width: '100%',
});

interface VerticalLayoutProps {
  children?: ReactNode;
  navColor?: NavColor;
  sections?: Section[];
}

export const VerticalLayout: FC<VerticalLayoutProps> = (props) => {
  const { children, sections, navColor } = props;
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  const mobileNav = useMobileNav();

  const cssVars = useCssVars(navColor || 'evident');
  const dispatch = useDispatch();
  const open = useSelector((state) => state.app.drawerOpen);

  const toggleOpen = useCallback(() => {
    dispatch(slice.actions.setDrawerOpen(!open));
  }, [open]);

  return (
    <>
      <Stack
        component="header"
        sx={{
          backdropFilter: 'blur(6px)',
          backgroundColor: (theme) => alpha(theme.palette.background.default, 0.8),
          position: 'sticky',
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          width: '100%',
        }}
        direction={lgUp ? 'row' : 'column'}
      >
        {lgUp && (
          <Box
            sx={{
              zIndex: (theme) => theme.zIndex.drawer + 1,
              position: 'sticky',
              top: '0px',
              left: open ? `${SIDE_NAV_WIDTH - 10}px` : '55px',
              transition: (theme) =>
                theme.transitions.create('left', {
                  easing: theme.transitions.easing.sharp,
                  duration: open
                    ? theme.transitions.duration.enteringScreen
                    : theme.transitions.duration.leavingScreen,
                }),
            }}
          >
            <IconButton
              disableRipple
              onClick={toggleOpen}
              sx={{
                position: 'sticky',
                '&.MuiButtonBase-root:hover': {
                  bgcolor: 'transparent',
                },
              }}
            >
              <svg
                width="24"
                height="77"
                xmlns="http://www.w3.org/2000/svg"
                fill={cssVars['--nav-bg']}
              >
                <g>
                  <path
                    d="m0,-0.23275l-0.15493,-0.15655l1.85366,2.99871c2.14811,3.37007 4.58454,5.16264 9.98812,7.8184c0.28591,0.14057 0.56778,0.27872 0.84622,0.4152l0.09645,0.04726c3.26776,1.60158 6.11938,2.99929 8.137,4.69906c1.88087,1.58457 3.00264,3.39547 3.27292,5.84035l0.06395,0l0,32.89482c0,2.99912 -1.10474,5.10953 -3.19064,6.91874c-2.02645,1.75763 -4.93521,3.18326 -8.28012,4.82262l-0.10038,0.04918c-0.27817,0.13631 -0.55976,0.27439 -0.84539,0.4148c-5.40358,2.65574 -7.33502,3.49593 -10.16606,8.04007l-1.38304,2.37589l-0.13775,-0.15655l0,-77.02201z"></path>
                </g>
              </svg>
              <SvgIcon
                sx={{
                  display: 'block',
                  position: 'absolute',
                  color: cssVars['--nav-color'],
                }}
              >
                {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </SvgIcon>
            </IconButton>
          </Box>
        )}

        <TopNav
          onMobileNavOpen={mobileNav.handleOpen}
          open={open}
        />
      </Stack>

      {lgUp && (
        <SideNav
          color={navColor}
          sections={sections}
          open={open}
          toggleOpen={toggleOpen}
        />
      )}
      {!lgUp && (
        <MobileNav
          color={navColor}
          onClose={mobileNav.handleClose}
          open={mobileNav.open}
          sections={sections}
        />
      )}
      <VerticalLayoutRoot open={open}>
        <VerticalLayoutContainer>
          <AppAccessBlockModal />
          {children}
        </VerticalLayoutContainer>
      </VerticalLayoutRoot>
    </>
  );
};

VerticalLayout.propTypes = {
  children: PropTypes.node,
  navColor: PropTypes.oneOf<NavColor>(['blend-in', 'discrete', 'evident']),
  sections: PropTypes.array,
};
