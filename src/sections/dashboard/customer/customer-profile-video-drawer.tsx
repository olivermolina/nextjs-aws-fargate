import { FC, useMemo } from 'react';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';

interface Props {
  container?: HTMLDivElement | null;
  open?: boolean;
  onClose?: () => void;
}

export const CustomerProfileVideoDrawer: FC<Props> = (props) => {
  const { container, onClose, open } = props;
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));

  const content: JSX.Element | null = useMemo(() => {
    return null;
  }, []);

  if (lgUp) {
    return (
      <Drawer
        anchor="right"
        open={open}
        PaperProps={{
          sx: {
            position: 'relative',
            width: 500,
          },
        }}
        SlideProps={{ container }}
        variant="persistent"
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      hideBackdrop
      ModalProps={{
        container,
        sx: {
          pointerEvents: 'none',
          position: 'absolute',
        },
      }}
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          maxWidth: '100%',
          width: 400,
          pointerEvents: 'auto',
          position: 'absolute',
        },
      }}
      SlideProps={{ container }}
      variant="temporary"
    >
      {content}
    </Drawer>
  );
};
