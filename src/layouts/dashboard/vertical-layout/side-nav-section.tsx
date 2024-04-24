import type { FC, ReactNode } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { SideNavItem } from './side-nav-item';

interface Item {
  disabled?: boolean;
  external?: boolean;
  icon?: ReactNode;
  items?: Item[];
  label?: ReactNode;
  path?: string;
  title: string;
  onClick?: () => void;
}

const renderItems = ({
  depth = 0,
  items,
  pathname,
  showTitle = true,
}: {
  depth?: number;
  items: Item[];
  pathname?: string | null;
  showTitle?: boolean;
}): JSX.Element[] =>
  items.reduce(
    (acc: JSX.Element[], item) =>
      reduceChildRoutes({
        acc,
        depth,
        item,
        pathname,
        showTitle,
      }),
    []
  );

const reduceChildRoutes = ({
  acc,
  depth,
  item,
  pathname,
  showTitle = true,
}: {
  acc: JSX.Element[];
  depth: number;
  item: Item;
  pathname?: string | null;
  showTitle?: boolean;
}): Array<JSX.Element> => {
  const checkPath = !!(item.path && pathname);
  const partialMatch = checkPath ? pathname.includes(item.path!) : false;
  const exactMatch = checkPath ? pathname === item.path : false;

  if (item.items) {
    acc.push(
      <SideNavItem
        active={partialMatch}
        depth={depth}
        disabled={item.disabled}
        icon={item.icon}
        key={item.title}
        label={item.label}
        open={partialMatch}
        title={item.title}
        showTitle={showTitle}
        onClick={item.onClick}
      >
        <Stack
          component="ul"
          spacing={0.5}
          sx={{
            listStyle: 'none',
            m: 0,
            p: 0,
          }}
        >
          {renderItems({
            depth: depth + 1,
            items: item.items,
            pathname,
            showTitle,
          })}
        </Stack>
      </SideNavItem>
    );
  } else {
    acc.push(
      <SideNavItem
        active={exactMatch}
        depth={depth}
        disabled={item.disabled}
        external={item.external}
        icon={item.icon}
        key={item.title}
        label={item.label}
        path={item.path}
        title={item.title}
        showTitle={showTitle}
        onClick={item.onClick}
      />
    );
  }

  return acc;
};

interface SideNavSectionProps {
  items?: Item[];
  pathname?: string | null;
  subheader?: string;
  showTitle?: boolean;
}

export const SideNavSection: FC<SideNavSectionProps> = (props) => {
  const { items = [], pathname, subheader = '', showTitle, ...other } = props;

  return (
    <Stack
      component="ul"
      spacing={0.5}
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0,
      }}
      {...other}
    >
      {subheader && showTitle && (
        <Box
          component="li"
          sx={{
            color: 'var(--nav-section-title-color)',
            fontSize: 12,
            fontWeight: 700,
            lineHeight: 1.66,
            mb: 1,
            ml: 1,
            textTransform: 'uppercase',
          }}
        >
          {subheader}
        </Box>
      )}
      {renderItems({ items, pathname, showTitle })}
    </Stack>
  );
};

SideNavSection.propTypes = {
  items: PropTypes.array,
  pathname: PropTypes.string,
  subheader: PropTypes.string,
};
