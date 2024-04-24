import { useCallback, useEffect, useState } from 'react';
import { trpc } from '../app/_trpc/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { AddressValidationSchema } from 'src/utils/zod-schemas/address';
import z from 'zod';

const FormSchema = AddressValidationSchema.and(
  z.object({
    bill_name: z.string(),
  }),
);

type FormInput = z.infer<typeof FormSchema>;

export const useAddressDetails = (userId: string, isBilling?: boolean) => {
  const [edit, setEdit] = useState(false);
  const { data, refetch } = trpc.user.get.useQuery(
    {
      id: userId,
    },
    {
      enabled: !!userId,
      refetchOnWindowFocus: false,
    },
  );
  const mutation = trpc.user.update.useMutation();

  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    reset,
    control,
  } = useForm<FormInput>({
    resolver: zodResolver(FormSchema),
  });

  const toggleEdit = () => setEdit((prev) => !prev);
  const onSubmit = useCallback(
    async (inputs: FormInput) => {
      try {
        const { bill_name, ...address } = inputs;
        await mutation.mutateAsync({
          id: userId,
          ...(isBilling
            ? {
              bill_name,
              billing_address: address,
            }
            : { address }),
        });
        await refetch();

        toggleEdit();
        toast.success(`${isBilling ? 'Billing' : 'Address'} details updated.`);
      } catch (e) {
        toast.error(e.message);
      }
    },
    [userId, isBilling],
  );

  const resetForm = useCallback(() => {
    if (data) {
      const address = isBilling ? data.billing_address : data.address;

      reset({
        bill_name: data.bill_name || '',
        address_line1: address?.address_line1 || '',
        address_line2: address?.address_line2 || '',
        city: address?.city || '',
        state: address?.state || '',
        postal_code: address?.postal_code || '',
        country: address?.country || '',
      });
    }
  }, [data, isBilling]);

  const onCancel = () => {
    resetForm();
    toggleEdit();
  };

  useEffect(() => {
    if (data) {
      resetForm();
    }
  }, [data]);

  return {
    register,
    handleSubmit,
    onSubmit,
    edit,
    toggleEdit,
    errors,
    isSubmitting,
    user: data,
    onCancel,
    control,
  };
};
