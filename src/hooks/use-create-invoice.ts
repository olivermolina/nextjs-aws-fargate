import { useState } from 'react';
import { trpc } from '../app/_trpc/client';
import type { InvoiceCreateInput } from 'src/utils/zod-schemas/invoice';
import { toast } from 'react-hot-toast';

export const useCreateInvoice = () => {
  const { data } = trpc.invoice.getNextInvoiceNumber.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const mutation = trpc.invoice.create.useMutation();

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const onSubmit = async (inputs: InvoiceCreateInput) => {
    try {
      const invoice = await mutation.mutateAsync(inputs);
      toast.success('Invoice created successfully');
      return invoice;
    } catch (e) {
      toast.error(e.message);
    }
  };

  return {
    open,
    setOpen,
    handleOpen,
    handleClose,
    onSubmit,
    invoiceNumber: data || '',
  };
};
