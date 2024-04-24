import { FaxInput } from '../utils/zod-schemas/fax';
import { trpc } from '../app/_trpc/client';
import toast from 'react-hot-toast';
import { useCallback, useState } from 'react';

interface EditorState {
  isFullScreen: boolean;
  isOpen: boolean;
}

export const useFaxCompose = (refetch?: any) => {

  const initialState: EditorState = {
    isFullScreen: false,
    isOpen: false,
  };

  const mutation = trpc.fax.create.useMutation();

  const [state, setState] = useState<EditorState>(initialState);

  const handleOpen = useCallback((): void => {
    setState((prevState) => ({
      ...prevState,
      isOpen: true,
    }));
  }, []);

  const handleClose = useCallback(
    (): void => {
      setState(initialState);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleMaximize = useCallback((): void => {
    setState((prevState) => ({
      ...prevState,
      isFullScreen: true,
    }));
  }, []);

  const handleMinimize = useCallback((): void => {
    setState((prevState) => ({
      ...prevState,
      isFullScreen: false,
    }));
  }, []);


  const handleSave = async (input: FaxInput) => {
    try {
      await mutation.mutateAsync(input);
      refetch?.();
      handleClose();
      toast.success('Fax sent successfully');
    } catch (e) {
      toast.error('Failed to send fax');
    }
  };

  return {
    state,
    handleOpen,
    handleClose,
    handleMaximize,
    handleMinimize,
    handleSave,
    isLoading: mutation.isLoading,
  };
};
