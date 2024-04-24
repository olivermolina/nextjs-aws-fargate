import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import * as React from 'react';
import { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import SvgIcon from '@mui/material/SvgIcon';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import { useDialog } from '../../../hooks/use-dialog';
import DeleteSectionPrompt from './delete-section-prompt';

type ChartItemMenuProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onAdd?: () => void;
  open?: boolean;
  isOutsideClick?: boolean;
  sectionLabel?: string | null;
};

export default function ChartItemMenu(props: ChartItemMenuProps) {
  const { sectionLabel, isOutsideClick, onEdit, onMoveDown, onMoveUp, onAdd, onDelete, open } =
    props;
  const [toggle, setToggle] = useState(false);
  const dialog = useDialog();

  useEffect(() => {
    if (isOutsideClick) {
      setToggle(false);
    }
  }, [isOutsideClick, open]);

  if ((isOutsideClick || (!open && !toggle)) && !dialog.open) return null;

  return (
    <>
      <Stack
        direction={'row'}
        spacing={1}
        justifyContent={'space-evenly'}
        alignItems={'center'}
      >
        {toggle && (
          <>
            {onDelete && (
              <Tooltip title="Delete Item">
                <IconButton
                  onClick={() => {
                    dialog.handleOpen();
                    setToggle(false);
                  }}
                  sx={(theme) => ({
                    backgroundColor: theme.palette.error.main,
                    color: theme.palette.error.contrastText,
                    '&:hover': {
                      backgroundColor: theme.palette.error.dark,
                    },
                  })}
                >
                  <SvgIcon fontSize={'small'}>
                    <DeleteIcon fontSize={'inherit'} />
                  </SvgIcon>
                </IconButton>
              </Tooltip>
            )}

            {onEdit && (
              <Tooltip title="Edit Item">
                <IconButton
                  onClick={() => {
                    onEdit?.();
                    setToggle(false);
                  }}
                  sx={(theme) => ({
                    color: 'black',
                    backgroundColor: theme.palette.neutral[200],
                    '&:hover': {
                      backgroundColor: theme.palette.neutral[300],
                    },
                  })}
                >
                  <SvgIcon fontSize={'small'}>
                    <EditIcon fontSize={'inherit'} />
                  </SvgIcon>
                </IconButton>
              </Tooltip>
            )}

            {onMoveUp && (
              <Tooltip title="Move Up">
                <IconButton
                  onClick={onMoveUp}
                  sx={(theme) => ({
                    color: 'black',
                    backgroundColor: theme.palette.neutral[200],
                    '&:hover': {
                      backgroundColor: theme.palette.neutral[300],
                    },
                  })}
                >
                  <SvgIcon fontSize={'small'}>
                    <ArrowUpwardIcon fontSize={'inherit'} />
                  </SvgIcon>
                </IconButton>
              </Tooltip>
            )}

            {onMoveDown && (
              <Tooltip title="Move Down">
                <IconButton
                  onClick={onMoveDown}
                  sx={(theme) => ({
                    color: 'black',
                    backgroundColor: theme.palette.neutral[200],
                    '&:hover': {
                      backgroundColor: theme.palette.neutral[300],
                    },
                  })}
                >
                  <SvgIcon fontSize={'small'}>
                    <ArrowDownwardIcon fontSize={'inherit'} />
                  </SvgIcon>
                </IconButton>
              </Tooltip>
            )}

            {onAdd && (
              <Tooltip title="Insert Item">
                <IconButton
                  onClick={() => {
                    onAdd?.();
                    setToggle(false);
                  }}
                  sx={(theme) => ({
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  })}
                >
                  <SvgIcon fontSize={'small'}>
                    <AddIcon fontSize={'inherit'} />
                  </SvgIcon>
                </IconButton>
              </Tooltip>
            )}
          </>
        )}

        <IconButton
          onClick={() => setToggle(!toggle)}
          sx={{
            backgroundColor: (theme) =>
              toggle ? theme.palette.warning.main : theme.palette.neutral[200],
            color: (theme) => (toggle ? theme.palette.warning.contrastText : 'inherit'),
            '&:hover': {
              backgroundColor: (theme) =>
                toggle ? theme.palette.warning.dark : theme.palette.neutral[300],
              color: (theme) => (toggle ? theme.palette.warning.contrastText : 'inherit'),
            },
          }}
        >
          <SvgIcon fontSize={'small'}>
            <MoreHorizIcon fontSize={'inherit'} />
          </SvgIcon>
        </IconButton>
      </Stack>

      <DeleteSectionPrompt
        open={dialog.open}
        sectionLabel={sectionLabel || ''}
        onClose={dialog.handleClose}
        onDelete={onDelete}
      />
    </>
  );
}
