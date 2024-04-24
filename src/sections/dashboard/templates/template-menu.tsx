import type { FC } from 'react';
import PropTypes from 'prop-types';
import Trash02Icon from '@untitled-ui/icons-react/build/esm/Trash02';
import Menu from '@mui/material/Menu';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import SvgIcon from '@mui/material/SvgIcon';
import Divider from '@mui/material/Divider';

interface TemplateMenuProps {
  anchorEl?: HTMLElement | null;
  onClose?: () => void;
  onDelete?: () => void;
  open?: boolean;
  onEdit?: () => void;
  onPublish?: () => void;
  onShare?: () => void;
}

export const TemplateMenu: FC<TemplateMenuProps> = (props) => {
  const { anchorEl, onClose, onDelete, onEdit, onPublish, open = false, onShare } = props;

  return (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'right',
        vertical: 'bottom',
      }}
      onClose={onClose}
      open={open}
      sx={{
        [`& .${menuItemClasses.root}`]: {
          fontSize: 14,
          '& svg': {
            mr: 1,
          },
        },
      }}
      transformOrigin={{
        horizontal: 'right',
        vertical: 'top',
      }}
    >
      <MenuItem
        onClick={() => {
          onEdit?.();
          onClose?.();
        }}
      >
        Edit
      </MenuItem>

      <MenuItem
        onClick={() => {
          onShare?.();
          onClose?.();
        }}
      >
        Share
      </MenuItem>

      <MenuItem
        onClick={() => {
          onPublish?.();
          onClose?.();
        }}
      >
        Publish to community
      </MenuItem>
      <Divider />

      <MenuItem
        onClick={() => {
          onDelete?.();
          onClose?.();
        }}
        sx={{ color: 'error.main' }}
      >
        <SvgIcon fontSize="small">
          <Trash02Icon />
        </SvgIcon>
        Delete
      </MenuItem>
    </Menu>
  );
};

TemplateMenu.propTypes = {
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  onDelete: PropTypes.func,
  open: PropTypes.bool,
};
