import { usePopover } from './use-popover';
import * as React from 'react';
import { useMemo, useRef, useState } from 'react';
import type { ReactSketchCanvasRef } from 'react-sketch-canvas';
import { useDialog } from './use-dialog';

export const useSketchToolbars = () => {
  const clearDialog = useDialog();
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const popover = usePopover<HTMLButtonElement>();
  const [color, setColor] = useState('black');
  const [tool, setTool] = React.useState<string>('pencil');

  const handleChangeTool = (event: React.MouseEvent<HTMLElement>, nextTool: string | null) => {
    if (nextTool !== null) {
      setTool(nextTool);
      canvasRef.current?.eraseMode(nextTool === 'eraser');
    }
  };

  const [stroke, setStroke] = React.useState<string>('small');
  const handleChangeStroke = (event: React.MouseEvent<HTMLElement>, nextStroke: string | null) => {
    if (nextStroke !== null) {
      setStroke(nextStroke);
    }
  };
  const handleChangeAction = (event: React.MouseEvent<HTMLElement>, nextAction: string) => {
    if (nextAction === null) {
      return;
    }

    switch (nextAction) {
      case 'undo':
        canvasRef.current?.undo();
        break;
      case 'redo':
        canvasRef.current?.redo();
        break;
      case 'clear':
        clearDialog.handleOpen();
        break;
    }
  };

  const strokeWidth = useMemo(() => {
    if (tool === 'pointer') return 0;

    switch (stroke) {
      case 'small':
        return 3;
      case 'medium':
        return 6;
      case 'large':
        return 9;
    }

  }, [stroke, tool]);

  return {
    popover,
    color,
    setColor,
    tool,
    handleChangeTool,
    stroke,
    handleChangeStroke,
    handleChangeAction,
    canvasRef,
    clearDialog,
    strokeWidth,
    setTool,
  };
};
