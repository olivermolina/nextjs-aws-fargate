import { useCallback, useEffect, useState } from 'react';

import { usePathname } from 'src/hooks/use-pathname';
import { useSelector } from 'src/store';

export const useMobileNav = () => {
  const pathname = usePathname();
  const showBlockMessage = useSelector((state) => state.app.showBlockMessage);
  const [open, setOpen] = useState<boolean>(false);

  const handlePathnameChange = useCallback((): void => {
    if (open || showBlockMessage) {
      setOpen(false);
    }
  }, [open, showBlockMessage]);

  useEffect(
    () => {
      handlePathnameChange();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname, showBlockMessage]
  );

  const handleOpen = useCallback((): void => {
    setOpen(true);
  }, []);

  const handleClose = useCallback((): void => {
    setOpen(false);
  }, []);

  return {
    handleOpen,
    handleClose,
    open,
  };
};
