import { bas6e4toBlob } from '../utils/base64ToBlob';
import toast from 'react-hot-toast';
import { trpc } from '../app/_trpc/client';

export const useGenerateChartPdf = (id: string) => {

  const pdfMutation = trpc.pdf.generate.useMutation();

  const generateChartPdf = async () => {
    try {
      const response = await pdfMutation.mutateAsync({
        url: `${window.location.origin}/chart/${id}`,
        waitForSelector: '.printAction',
      });

      // Check if the request was successful
      if (!response) {
        throw new Error('Failed to generate PDF');
      }

      // Get the PDF data as a blob
      const blob = bas6e4toBlob(response, 'application/pdf');

      // Create an object URL from the blob
      const blobUrl = URL.createObjectURL(blob);

      // Create a link element
      const link = document.createElement('a');

      // Set the href to the blob URL
      link.href = blobUrl;

      // Set the download attribute to the desired file name
      link.download = 'Chart.pdf';

      // Append the link to the document body
      document.body.appendChild(link);

      // Programmatically click the link to start the download
      link.click();

      // Remove the link from the document body
      document.body.removeChild(link);
    } catch (e) {
      toast.error('Failed to generate PDF');
    }
  };

  return {
    generateChartPdf,
    isLoading: pdfMutation.isLoading,
  };
};
