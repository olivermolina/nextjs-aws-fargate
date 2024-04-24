import type { FC } from 'react';
import PropTypes from 'prop-types';
import Menu01Icon from '@untitled-ui/icons-react/build/esm/Menu01';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';

interface LogisticsFleetToolbarProps {
  onDrawerOpen?: () => void;
}

export const LogisticsFleetToolbar: FC<LogisticsFleetToolbarProps> = (props) => {
  const { onDrawerOpen } = props;

  return (
    <Box
      sx={{
        left: 0,
        p: 2,
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        width: '100%',
        zIndex: 10,
      }}
    >
      <Card
        sx={{
          p: 2,
          pointerEvents: 'auto',
        }}
      >
        <IconButton onClick={onDrawerOpen}>
          <SvgIcon>
            <Menu01Icon />
          </SvgIcon>
        </IconButton>
      </Card>
    </Box>
  );
};

LogisticsFleetToolbar.propTypes = {
  onDrawerOpen: PropTypes.func,
};
