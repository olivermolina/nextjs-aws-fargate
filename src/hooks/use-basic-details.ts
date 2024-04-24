import { useCallback, useEffect, useState } from 'react';
import { trpc } from '../app/_trpc/client';
import { useForm } from 'react-hook-form';
import { UpdateUserInput, UpdateUserValidationSchema } from '../utils/zod-schemas/user';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Gender } from '@prisma/client';
import { useFileInput } from './use-file-input';

export const useBasicDetails = (userId: string) => {
  const { handleFileInput, fileInput, setFileInput } = useFileInput();

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

  const { data: avatarData, refetch: refetchAvatar } = trpc.user.getUserAvatar.useQuery({
    id: userId,
  }, {
    refetchOnWindowFocus: false,
  });

  const avatarMutation = trpc.user.saveUserAvatar.useMutation();

  const handleSaveAvatar = async (file: typeof fileInput) => {
    if (!file) return;

    try {
      await avatarMutation.mutateAsync({
        id: userId,
        file,
      });
      refetchAvatar();
    } catch (e) {
      toast.error(e);
    }
  };

  const mutation = trpc.user.update.useMutation();

  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    reset,
    setValue,
    control,
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(UpdateUserValidationSchema),
  });

  const toggleEdit = () => setEdit((prev) => !prev);
  const onSubmit = useCallback(
    async (inputs: UpdateUserInput) => {
      try {
        await mutation.mutateAsync(inputs);
        await refetch();

        toggleEdit();
        toast.success('Basic details updated.');
      } catch (e) {
        toast.error(e.message);
      }
    },
    [userId],
  );

  const resetForm = useCallback(() => {
    if (data) {
      reset({
        id: data.id,
        email: data.email,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        birthdate: data.birthdate || new Date(),
        gender: data.gender || Gender.OTHER,
        phone: data.phone || '',
      });
    }
  }, [data]);

  const onCancel = () => {
    resetForm();
    toggleEdit();
  };

  useEffect(() => {
    if (data) {
      resetForm();
    }
  }, [data]);

  useEffect(() => {
    if (fileInput) {
      handleSaveAvatar(fileInput);
    }
  }, [fileInput]);

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
    setValue,
    control,
    handleFileInput,
    fileInput,
    setFileInput,
    avatarUrl: avatarData,
  };
};
