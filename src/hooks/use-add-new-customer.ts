import { useAuth } from './use-auth';
import { useTheme } from '@mui/material/styles';
import { useTimezone } from './use-timezone';
import { useForm } from 'react-hook-form';
import { PatientInput, PatientValidationSchema } from '../types/patient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useState } from 'react';
import { trpc } from '../app/_trpc/client';
import { LogAction, Prisma, UserType } from '@prisma/client';
import { useInvite } from './use-invite-patient';
import { SelectChangeEvent } from '@mui/material/Select';
import toast from 'react-hot-toast';
import { useCreateLog } from './use-create-log';

export const useAddNewCustomer = (refetch?: any) => {
  const { user } = useAuth();
  const theme = useTheme();
  const timezone = useTimezone();
  const {
    formState: { errors },
    register,
    handleSubmit,
    clearErrors,
    reset,
  } = useForm<PatientInput>({
    resolver: zodResolver(PatientValidationSchema),
    mode: 'all',
    shouldFocusError: true,
    shouldUseNativeValidation: false,
  });
  const [open, setOpen] = useState(false);
  const mutation = trpc.user.create.useMutation();
  const { data: staffsData } = trpc.user.list.useQuery(
    {
      type: [UserType.STAFF],
      sortDir: Prisma.SortOrder.asc,
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const inviteToPortal = useInvite();

  const [assignedStaffs, setAssignedStaffs] = useState<string[]>([]);

  const handleRemoveStaff = (userId: string) => {
    setAssignedStaffs((prev) => prev.filter((item) => item !== userId));
  };

  const handleChange = (event: SelectChangeEvent<typeof assignedStaffs>) => {
    const {
      target: { value },
    } = event;
    setAssignedStaffs(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const handleClose = () => {
    setOpen(false);
    clearErrors();
    reset();
    setAssignedStaffs([]);
  };
  const handleOpen = () => {
    setOpen(true);
  };

  const createLog = useCreateLog();

  const onSubmit = useCallback(
    async (data: PatientInput) => {
      if (!user) {
        toast('User not found');
        return;
      }

      try {
        const result = await mutation.mutateAsync({
          ...data,
          assignedStaffs: data.assignedStaffs === '' ? [] : data.assignedStaffs,
          type: UserType.PATIENT,
          timezone: timezone.value,
          organization_id: user.organization_id,
        });
        handleClose();
        inviteToPortal.handleOpenInvite();
        await refetch?.();
        createLog.save({
          user_id: result.id,
          text: 'the patient',
          action: LogAction.CREATE,
        });
      } catch (e) {
        toast.error(e.message);
      }
    },
    [timezone, user],
  );

  return {
    createUserDialog: {
      open,
      handleClose,
      handleOpen,
      handleChange,
      assignedStaffs,
      theme,
      staffs: staffsData?.items || [],
      errors,
      register,
      onSubmit,
      handleSubmit,
      handleRemoveStaff,
      isLoading: mutation.isLoading,
    },
    inviteToPortal: {
      ...inviteToPortal,
      patient: mutation.data,
    },
  };
};
