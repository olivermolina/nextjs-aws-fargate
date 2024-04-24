import { useDialog } from './use-dialog';
import { trpc } from '../app/_trpc/client';
import toast from 'react-hot-toast';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';

const ValidationSchema = z.object({
  patientIds: z.array(z.string()).nonempty('Patient IDs must be provided'),
  staffIds: z.array(z.string()).nonempty('Must select at least one staff'),
  action: z.enum(['add', 'update']),
});

type Input = z.infer<typeof ValidationSchema>;

export const useAssignStaff = (
  refetch: any,
  patientIds: string[],
  defaultStaffIds: string[],
  handleDeselectAll?: () => void,
  action?: 'add' | 'update',
) => {
  const dialog = useDialog();

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    control,
    setValue,
  } = useForm<Input>({
    resolver: zodResolver(ValidationSchema),
    mode: 'all',
    shouldFocusError: true,
    shouldUseNativeValidation: false,
  });

  const handleRemoveStaff = (staffIds: [string, ...string[]]) => {
    setValue('staffIds', staffIds);
  };

  const mutation = trpc.user.assignStaff.useMutation();

  const onSubmit = useCallback(
    async (data: Input) => {
      try {
        await mutation.mutateAsync(data);
        await refetch();
        dialog.handleClose();
        handleDeselectAll?.();
        setValue('staffIds', [] as unknown as [string, ...string[]]);

        toast.success(action === 'update' ? 'Updated successfully' : 'Assigned staff successfully');
      } catch (error) {
        toast.error(error.message);
      }
    },
    [patientIds, refetch],
  );

  useEffect(() => {
    if (mutation.isLoading || isSubmitting) return;

    if (defaultStaffIds.length > 0) {
      setValue('staffIds', defaultStaffIds as [string, ...string[]]);
    }
    if (patientIds.length > 0) {
      setValue('patientIds', patientIds as [string, ...string[]]);
    }
    setValue('action', action || 'add');
  }, [patientIds, action, defaultStaffIds, mutation.isLoading, isSubmitting]);

  return {
    dialog,
    isLoading: mutation.isLoading || isSubmitting,
    handleSubmit,
    onSubmit,
    errors,
    control,
    handleRemoveStaff,
  };
};
