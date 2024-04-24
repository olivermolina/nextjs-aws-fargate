import { trpc } from '../app/_trpc/client';
import { Gender } from '@prisma/client';
import toast from 'react-hot-toast';
import { useDialog } from './use-dialog';
import dayjs from 'dayjs';

const GenderMap: Record<string, Gender> = {
  male: Gender.MALE,
  female: Gender.FEMALE,
  other: Gender.OTHER,
};

export const useImportPatients = (refetch?: any) => {
  const mutation = trpc.user.importPatients.useMutation();
  const importDialog = useDialog();

  const handleImport = async (data: any) => {
    importDialog.handleClose();

    if (data?.rows && data?.rows.length === 0) {
      toast.error('No patients to import');
      return;
    }

    try {
      const formattedData = data?.rows.map(({ values }: any) => ({
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        birthdate: dayjs(values.birthday).isValid() ? dayjs(values.birthday).toDate() : undefined,
        phone: values.phone_number,
        address: values.address,
        status: values.status.toLowerCase() === 'active',
        gender: Object.keys(GenderMap).includes(values.gender?.toLowerCase())
          ? GenderMap[values.gender?.toLowerCase()]
          : GenderMap.none,
      }));

      await mutation.mutateAsync(formattedData);
      toast.success('Patients imported successfully');
      await refetch?.();
    } catch (e) {
      toast.error('Failed to import patients. Please try again.');
    }
  };

  return {
    handleImport,
    isLoading: mutation.isLoading,
    importDialog,
  };
};
