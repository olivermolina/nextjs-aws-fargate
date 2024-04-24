import { trpc } from '../app/_trpc/client';
import toast from 'react-hot-toast';
import { useDialog } from './use-dialog';
import { getQueryKey } from '@trpc/react-query';
import { useQueryClient } from '@tanstack/react-query';

export const useChartTemplate = (chartId: string) => {
  const dialog = useDialog<string>();
  const queryClient = useQueryClient();
  const queryKey = getQueryKey(trpc.chart.templateList, undefined, 'query');

  const mutation = trpc.chart.saveChartTemplate.useMutation({
    onError: (err, input, context) => {
      queryClient.invalidateQueries({ queryKey });
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const shareMutation = trpc.chart.shareChartTemplate.useMutation();

  const handleSaveAsTemplate = async () => {
    try {
      const result = await mutation.mutateAsync({
        chartId,
      });
      dialog.handleOpen(result.id);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleShare = async (templateId: string) => {
    try {
      await shareMutation.mutateAsync({
        id: templateId,
        shared: ['organization'],
      });
      dialog.handleClose();
      toast.success('Template shared!');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return {
    handleSaveAsTemplate,
    isLoading: mutation.isLoading,
    dialog,
    handleShare,
  };
};
