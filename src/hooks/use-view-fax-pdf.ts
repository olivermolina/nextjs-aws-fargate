import { useDialog } from './use-dialog';

export const useViewFaxPdf = () => {
  const dialog = useDialog<{
    sFaxDetailsID: string;
    sDirection: 'IN' | 'OUT';
  }>();
  const handleView = (fileName: string, direction: 'IN' | 'OUT') => {
    const [, sFaxDetailsID] = fileName.split('|');
    dialog.handleOpen({
      sFaxDetailsID,
      sDirection: direction,
    });
  };

  return {
    dialog,
    handleView,
  };
};
