import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { trpc } from '../../../app/_trpc/client';
import { useOrganizationCurrency } from '../../../hooks/use-organization-currency';
import Avatar from '@mui/material/Avatar';
import { grey } from '@mui/material/colors';
import GettingStartedCreateAppointmentForm from './getting-started-create-appointment-form';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { ServicesInput, ServicesValidationSchema } from '../../../utils/zod-schemas/service';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import BackdropLoading from '../account/account-billing-reactivate-backdrop';

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion
    disableGutters
    elevation={0}
    square
    {...props}
  />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&::before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : 'rgba(0, 0, 0, .03)',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

type GettingStartedAddClientsProps = {
  handleNext: () => void;
};

export default function GettingStartedCreateAppointmentTypes({
                                                               handleNext,
                                                             }: GettingStartedAddClientsProps) {
  const [expanded, setExpanded] = useState<string | number | false>(false);
  const handleChange = (panel: string | number) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false);
  };

  const { symbol, currency } = useOrganizationCurrency();
  const methods = useForm<ServicesInput>({
    mode: 'onChange',
    reValidateMode: 'onBlur',
    resolver: zodResolver(ServicesValidationSchema),
  });
  const { control, reset } = methods;

  const { fields, append } = useFieldArray({
    control,
    name: 'services',
  });

  trpc.service.list.useQuery(
    {
      rowsPerPage: 1000,
      page: 0,
    },
    {
      keepPreviousData: true,
      onSettled: (data) => {
        reset({
          services:
            data?.items?.map((service) => ({
              id: service.id,
              name: service.name,
              duration: service.duration,
              price: service.price,
              code: service.code,
              taxable: service.taxable,
            })) || [],
        });
      },
    },
  );

  const mutation = trpc.service.saveServices.useMutation({
    onSettled: (data) => {
      reset({
        services:
          data?.map((service) => ({
            id: service.id,
            name: service.name,
            duration: service.duration,
            price: service.price,
            code: service.code,
            taxable: service.taxable,
          })) || [],
      });
    },
  });

  const handleAddService = () => {
    append({
      name: 'Untitled',
      duration: 0,
      price: 0,
      code: '',
      taxable: false,
    });
  };

  const onSubmit = async (data: ServicesInput) => {
    try {
      await mutation.mutateAsync(data);
      toast.success('Services saved successfully');
    } catch (e) {
      toast.error('Failed to save services. Please try again.');
    }
  };
  return (
    <>
      <Container>
        <Stack
          spacing={1}
          alignItems={'center'}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'normal',
            }}
          >
            Schedule & bill fast
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 'normal',
              pb: 2,
            }}
          >
            Streamline your scheduling and billing by customizing your services, prices, and billing
            codes
          </Typography>
          <Box
            component={'form'}
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', lg: 600 },
              mb: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <FormProvider {...methods}>
              {fields.map((service, index) => (
                <Accordion
                  key={service.id}
                  expanded={expanded === index}
                  onChange={handleChange(index)}
                >
                  <AccordionSummary
                    aria-controls={`panel-${service.id}-content`}
                    id={`panel-${service.id}-header`}
                  >
                    <Stack>
                      <Typography variant={'subtitle1'}>{service.name}</Typography>
                      <Stack
                        direction={'row'}
                        spacing={1}
                        alignItems={'center'}
                      >
                        <Typography
                          variant={'subtitle2'}
                          color={'text.secondary'}
                        >
                          {service.duration} mins
                        </Typography>
                        <Avatar sx={{ bgcolor: grey[500], width: 5, height: 5 }}> {''}</Avatar>
                        <Typography
                          variant={'subtitle2'}
                          color={'text.secondary'}
                        >
                          {symbol}
                          {service.price}
                        </Typography>
                        {service.code && (
                          <>
                            <Avatar sx={{ bgcolor: grey[500], width: 5, height: 5 }}> {''}</Avatar>
                            <Typography
                              variant={'subtitle2'}
                              color={'text.secondary'}
                            >
                              {service.code}
                            </Typography>
                          </>
                        )}
                      </Stack>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <GettingStartedCreateAppointmentForm
                      currency={currency}
                      index={index}
                    />
                  </AccordionDetails>
                </Accordion>
              ))}
            </FormProvider>
            <Button
              startIcon={
                <SvgIcon>
                  <PlusIcon />
                </SvgIcon>
              }
              onClick={handleAddService}
            >
              Add another
            </Button>
          </Box>
          <Button
            variant={'contained'}
            sx={{
              width: 150,
            }}
            onClick={methods.handleSubmit(onSubmit)}
          >
            Save
          </Button>
          <Button onClick={handleNext}>Skip</Button>
        </Stack>
      </Container>
      <BackdropLoading
        open={mutation.isLoading}
        message={'Saving services...'}
      />
    </>
  );
}
