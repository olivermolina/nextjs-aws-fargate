import { useRef, useState } from 'react';
import useOutsideClick from './use-outside-click';

export const useChartShowMoreMenu = (itemName?: string) => {
  const [open, setOpen] = useState(false);
  const [isOutsideClick, setIsOutsideClick] = useState(false);
  const ref = useRef();
  useOutsideClick(ref, () => {
    setIsOutsideClick(true);
  });

  const handleReset = () => {
    setOpen(true);
    setIsOutsideClick(false);
  };

  const handleClose = () => {
    setOpen(false);
    setIsOutsideClick(false);
  };

  return {
    open,
    setOpen,
    isOutsideClick,
    setIsOutsideClick,
    ref,
    handleReset,
    handleClose,
  };
};
