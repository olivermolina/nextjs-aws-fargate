import React, { FC, ReactNode } from 'react';
import PropTypes from 'prop-types';
import useMediaQuery from '@mui/material/useMediaQuery';
import { styled } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles/createTheme';

import type { NavColor } from 'src/types/settings';

import type { Section } from '../config';
import { MobileNav } from '../mobile-nav';
import { TopNav } from './top-nav';
import { useMobileNav } from './use-mobile-nav';
import AppAccessBlockModal from '../../../sections/dashboard/app-access/app-access-block-modal';

const HorizontalLayoutRoot = styled('div')({
  display: 'flex',
  flex: '1 1 auto',
  maxWidth: '100%',
});

const HorizontalLayoutContainer = styled('div')({
  display: 'flex',
  flex: '1 1 auto',
  flexDirection: 'column',
  width: '100%',
});

interface HorizontalLayoutProps {
  children?: ReactNode;
  navColor?: NavColor;
  sections?: Section[];
}

export const HorizontalLayout: FC<HorizontalLayoutProps> = (props) => {
  const { children, navColor, sections } = props;
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  const mobileNav = useMobileNav();

  return (
    <>
      <TopNav
        color={navColor}
        onMobileNav={mobileNav.handleOpen}
        sections={sections}
      />
      {!lgUp && (
        <MobileNav
          color={navColor}
          onClose={mobileNav.handleClose}
          open={mobileNav.open}
          sections={sections}
        />
      )}
      <HorizontalLayoutRoot>
        <HorizontalLayoutContainer>
          <AppAccessBlockModal />
          {children}
        </HorizontalLayoutContainer>
      </HorizontalLayoutRoot>
    </>
  );
};

HorizontalLayout.propTypes = {
  children: PropTypes.node,
  navColor: PropTypes.oneOf<NavColor>(['blend-in', 'discrete', 'evident']),
  sections: PropTypes.array,
};
