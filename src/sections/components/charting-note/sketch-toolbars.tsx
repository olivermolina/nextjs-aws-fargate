import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import SvgIcon from '@mui/material/SvgIcon';
import ModeIcon from '@mui/icons-material/Mode';
import EraserIcon from '../../../icons/untitled-ui/duocolor/eraser';
import CircleIcon from '@mui/icons-material/Circle';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import ClearIcon from '@mui/icons-material/Clear';
import PanToolAltIcon from '@mui/icons-material/PanToolAlt';
import * as React from 'react';
import Menu from '@mui/material/Menu';
import { HexColorPicker } from 'react-colorful';
import { useSketchToolbars } from '../../../hooks/use-sketch-toolbars';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';


type Props = {
  sketchToolbars: ReturnType<typeof useSketchToolbars>;
  showPointerTool?: boolean;
};

export default function SketchToolbars({ sketchToolbars, showPointerTool }: Props) {
  const {
    popover,
    color,
    setColor,
    handleChangeTool,
    stroke,
    handleChangeStroke,
    handleChangeAction,
    tool,
    clearDialog,
    canvasRef,
  } = sketchToolbars;
  return (
    <>
      <Stack
        spacing={1}
        sx={{
          maxWidth: 50,
        }}
        alignItems={'Center'}
      >
        {/*Color Picker*/}
        <Box>
          <Tooltip title={'Select color'}>
            <IconButton
              ref={popover.anchorRef}
              sx={{
                backgroundColor: color,
                '&:hover': {
                  backgroundColor: color,
                },
                width: 35,
                height: 35,
              }}
              onClick={popover.handleOpen}
            />
          </Tooltip>
        </Box>

        {/*Pointer/Eraser/Pencil group*/}
        <ToggleButtonGroup
          orientation="vertical"
          value={tool}
          exclusive
          onChange={handleChangeTool}
          sx={{
            borderColor: 'neutral.400',
            borderStyle: 'solid',
            borderWidth: '1px',
          }}
        >
          {showPointerTool && (
            <ToggleButton
              value="pointer"
              aria-label="list"
              sx={{
                width: 40,
                height: 40,
              }}
            >
              <Tooltip title={'Use pointer tool'}>
                <SvgIcon fontSize={'small'}>
                  <PanToolAltIcon />
                </SvgIcon>
              </Tooltip>
            </ToggleButton>
          )}

          <ToggleButton
            value="pencil"
            aria-label="list"
            sx={{
              width: 40,
              height: 40,
            }}
          >
            <Tooltip title={'Use pencil tool'}>
              <SvgIcon fontSize={'small'}>
                <ModeIcon />
              </SvgIcon>
            </Tooltip>
          </ToggleButton>
          <ToggleButton
            value="eraser"
            aria-label="eraser"
            sx={{
              width: 40,
              height: 40,
            }}
          >
            <Tooltip title={'Use eraser tool'}>
              <SvgIcon fontSize={'small'}>
                <EraserIcon />
              </SvgIcon>
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        {/*Stroke button group*/}
        <ToggleButtonGroup
          orientation="vertical"
          value={stroke}
          exclusive
          onChange={handleChangeStroke}
          sx={{
            borderColor: 'neutral.400',
            borderStyle: 'solid',
            borderWidth: '1px',
          }}
        >
          <ToggleButton
            value="small"
            aria-label="small"
            sx={{
              width: 40,
              height: 40,
            }}
          >
            <Tooltip title={'Use small tool'}>
              <SvgIcon
                sx={{
                  fontSize: 10,
                }}
              >
                <CircleIcon fontSize={'inherit'} />
              </SvgIcon>
            </Tooltip>
          </ToggleButton>
          <ToggleButton
            value="medium"
            aria-label="medium"
            sx={{
              width: 40,
              height: 40,
            }}
          >
            <Tooltip title={'Use medium tool'}>
              <SvgIcon
                sx={{
                  fontSize: 14,
                }}
              >
                <CircleIcon fontSize={'inherit'} />
              </SvgIcon>
            </Tooltip>
          </ToggleButton>

          <ToggleButton
            value="large"
            aria-label="large"
            sx={{
              width: 40,
              height: 40,
            }}
          >
            <Tooltip title={'Use large tool'}>
              <SvgIcon
                sx={{
                  fontSize: 18,
                }}
              >
                <CircleIcon fontSize={'inherit'} />
              </SvgIcon>
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        {/*Action button group*/}
        <ToggleButtonGroup
          orientation="vertical"
          exclusive
          onChange={handleChangeAction}
          sx={{
            borderColor: 'neutral.400',
            borderStyle: 'solid',
            borderWidth: '1px',
          }}
        >
          <ToggleButton
            value="undo"
            aria-label="undo"
            sx={{
              width: 40,
              height: 40,
            }}
          >
            <Tooltip title={'Undo'}>
              <SvgIcon fontSize={'small'}>
                <RedoIcon fontSize={'inherit'} />
              </SvgIcon>
            </Tooltip>
          </ToggleButton>
          <ToggleButton
            value="redo"
            aria-label="redo"
            sx={{
              width: 40,
              height: 40,
            }}
          >
            <Tooltip title={'Redo'}>
              <SvgIcon fontSize={'small'}>
                <UndoIcon fontSize={'inherit'} />
              </SvgIcon>
            </Tooltip>
          </ToggleButton>
          <ToggleButton
            value="clear"
            aria-label="clear"
            sx={{
              width: 40,
              height: 40,
            }}
          >
            <Tooltip title={'Clear all'}>
              <SvgIcon fontSize={'small'}>
                <ClearIcon fontSize={'inherit'} />
              </SvgIcon>
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* HexColorPicker Menu */}
      <Menu
        anchorEl={popover.anchorRef.current}
        onClose={popover.handleClose}
        open={popover.open}
      >
        <HexColorPicker
          color={color}
          onChange={setColor}
        />
      </Menu>

      {/* Clear sketch dialog */}
      <Dialog
        fullWidth
        maxWidth="sm"
        open={sketchToolbars.clearDialog.open}
      >
        <DialogTitle>
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
            spacing={3}
          >
            <Typography variant="h6">Are you sure?</Typography>
            <IconButton
              color="inherit"
              onClick={clearDialog.handleClose}
            >
              <SvgIcon>
                <XIcon />
              </SvgIcon>
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant={'body1'}>You are about to erase this sketch.</Typography>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'flex-end',
            display: 'flex',
            mx: 1,
          }}
        >
          <Button
            autoFocus
            onClick={clearDialog.handleClose}
            variant={'outlined'}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              canvasRef.current?.clearCanvas();
              clearDialog.handleClose();
            }}
            variant={'contained'}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
