import { QuillEditor } from '../../../components/quill-editor';
import React from 'react';
import { trpc } from '../../../app/_trpc/client';
import toast from 'react-hot-toast';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

const ValidationSchema = z.object({
  id: z.string(),
  quick_notes: z.string(),
});

export type Input = z.infer<typeof ValidationSchema>;

type Props = {
  id: string;
  quickNotes: string;
  refetch?: any;
};

export default function CustomerProfileQuickNotes(props: Props) {
  const { id, quickNotes, refetch } = props;
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<Input>({
    resolver: zodResolver(ValidationSchema),
    defaultValues: {
      id,
      quick_notes: quickNotes,
    },
  });

  const mutation = trpc.user.saveQuickNotes.useMutation();

  const onSubmit = async (data: Input) => {
    try {
      await mutation.mutateAsync(data);
      refetch?.();
      toast.success('Quick notes has been saved.');
    } catch (e) {
      toast.error(e);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={1}>
        <Controller
          control={control}
          name="quick_notes"
          render={({ field }) => {
            return (
              <QuillEditor
                {...field}
                sx={{
                  flexGrow: 1,
                  minHeight: 300,
                  maxHeight: 500,
                }}
              />
            );
          }}
        />
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={1}
        >
          <Button
            variant="contained"
            color="primary"
            type={'submit'}
            disabled={isSubmitting}
          >
            Save
            {isSubmitting && (
              <CircularProgress
                sx={{ ml: 1 }}
                size={20}
              />
            )}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
