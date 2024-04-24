import { useAuth } from '../../../hooks/use-auth';
import React, { useState } from 'react';
import { statusMap } from '../consultation/consultation-list-table';
import { Card, CardContent, styled, Typography } from '@mui/material';
import CardHeader from '@mui/material/CardHeader';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Stack from '@mui/material/Stack';
import { SeverityPill, type SeverityPillColor } from '../../../components/severity-pill';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import dayjs from 'dayjs';
import CardActions from '@mui/material/CardActions';
import Link from '@mui/material/Link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import numeral from 'numeral';
import {
  Address,
  Chart,
  Consultation,
  ConsultationStaff,
  Invoice,
  InvoiceStatus,
  Service,
  User,
} from '@prisma/client';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { trpc } from '../../../app/_trpc/client';
import toast from 'react-hot-toast';
import { useRouter } from '../../../hooks/use-router';
import BackdropLoading from '../account/account-billing-reactivate-backdrop';
import { useCreateChartingNote } from '../../../hooks/use-create-charting-note';
import CustomerNewChartingNoteModal from './customer-new-charting-note-modal';
import { CreateChartInput } from '../../../utils/zod-schemas/chart';
import Button from '@mui/material/Button';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import SvgIcon from '@mui/material/SvgIcon';
import { useUpdateSearchParams } from '../../../hooks/use-update-search-params';
import UserAvatar from '../../../components/user-avatar';
import { ChartCardContent } from './customer-profile-chart-card-content';

const invoiceStatusMap: Record<InvoiceStatus, SeverityPillColor> = {
  PAID: 'success',
  PENDING: 'warning',
  CANCELED: 'error',
};

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

export const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

type CustomerProfileConsultationCardProps = {
  appointment: Consultation & {
    service: Service | null;
    invoice: Invoice | null;
    Charts: (Chart & {
      signed_by: User | null;
      user: User & {
        address: Address | null;
      };
      created_by: User;
    })[];
    staffs: ConsultationStaff[];
  };
  createdBy: User;
  refetchFeeds?: any;
};

export default function CustomerProfileConsultationCard({
                                                          appointment,
                                                          createdBy,
                                                          refetchFeeds,
                                                        }: CustomerProfileConsultationCardProps) {
  const router = useRouter();
  const mutation = trpc.consultation.createConsultationInvoice.useMutation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const { user } = useAuth();
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const statusColor = statusMap[appointment.status] || 'warning';

  const handleCreateInvoice = async () => {
    handleClose();
    try {
      const result = await mutation.mutateAsync({
        id: appointment.id,
      });
      if (result) {
        router.push('/dashboard/invoices/' + result.id);
      }
      toast.success('Invoice created successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };
  const { replaceSearchParams } = useUpdateSearchParams();
  const handleViewChart = (id: string) => {
    replaceSearchParams({ tab: 'profile', chartId: id });
  };

  const createChartingNote = useCreateChartingNote(refetchFeeds);

  return (
    <>
      <BackdropLoading
        open={mutation.isLoading}
        message={'Creating invoice...'}
      />

      <Card
        raised
        sx={{ mr: 2, width: 'auto', mb: 2 }}
      >
        <CardHeader
          avatar={<CalendarTodayIcon sx={{ color: 'grey.400' }} />}
          action={
            <Stack
              direction={'row'}
              spacing={1}
            >
              <SeverityPill color={statusColor}>{appointment.status}</SeverityPill>
              <IconButton
                aria-label="settings"
                onClick={handleClick}
              >
                <MoreVertIcon />
              </IconButton>
            </Stack>
          }
          title={
            <Typography variant={'subtitle1'}>
              {appointment.service?.name || appointment.title || ''}
            </Typography>
          }
          subheader={
            <Typography color={'text.secondary'}>
              {`${dayjs(appointment.start_time).format('dddd, MMMM D, YYYY')} · ${dayjs(
                appointment.start_time,
              ).format('hh:mm A')} - ${dayjs(appointment.end_time).format('hh:mm A')}`}
            </Typography>
          }
          sx={{
            px: 4,
            pb: 0,
            '& .MuiCardHeader-action': { mt: '0' },
          }} // Adjust the action icon button to align with the title
        />

        <CardActions sx={{ px: 4, justifyContent: 'space-between' }}>
          <Stack
            spacing={2}
            alignItems={'flex-start'}
          >
            {appointment.Charts?.map((chart) => (
              <Stack
                key={chart.id}
                direction={'row'}
                spacing={1}
                alignItems={'center'}
              >
                <Typography variant={'subtitle1'}>{chart.name}</Typography>
                <Button
                  size={'small'}
                  endIcon={
                    <SvgIcon fontSize="small">
                      <FileOpenIcon color={'primary'} />
                    </SvgIcon>
                  }
                  onClick={() => handleViewChart(chart.id)}
                  sx={{
                    p: 0.2,
                  }}
                >
                  <Typography variant={'caption'}>View</Typography>
                </Button>
              </Stack>
            ))}
            {appointment.invoice && (
              <Stack
                direction={'row'}
                spacing={1}
              >
                <Link
                  color="text.primary"
                  target="_blank"
                  rel="noopener"
                  href={'/dashboard/invoices/' + appointment.invoice.id}
                  sx={{
                    alignItems: 'center',
                    display: 'inline-flex',
                  }}
                >
                  <Typography
                    color="primary.main"
                    variant="subtitle2"
                  >
                    {appointment.invoice.invoice_number}
                  </Typography>
                </Link>
                <SeverityPill color={invoiceStatusMap[appointment.invoice.status]}>
                  {appointment.invoice.status}
                </SeverityPill>
              </Stack>
            )}
            <UserAvatar
              userId={createdBy.id}
              justifyContent={'flex-start'}
            />
          </Stack>
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        </CardActions>

        <Collapse
          in={expanded}
          timeout="auto"
          unmountOnExit
        >
          <Stack spacing={2}>
            <CardContent sx={{ py: 0 }}>
              <Stack
                spacing={1}
                sx={{
                  px: 1,
                }}
              >
                <Typography
                  paragraph
                  sx={{ color: 'text.secondary' }}
                  variant={'body1'}
                >
                  Service
                </Typography>
                <Typography
                  paragraph
                  variant={'body1'}
                >
                  {`${appointment.service?.name} • ${numeral(
                    appointment.service?.price || 0,
                  ).format(`${user?.organization.currency_symbol}0,0.00`)}`}
                </Typography>
              </Stack>
            </CardContent>
            {appointment.Charts?.map((chart) => (
              <ChartCardContent
                chart={chart}
                key={chart.id}
              />
            ))}
          </Stack>
        </Collapse>
      </Card>

      <Menu
        id="file-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'actions-button',
        }}
      >
        {appointment.Charts?.length > 0 && (
          <MenuItem onClick={() => handleViewChart(appointment.Charts[0].id)}>View</MenuItem>
        )}

        {appointment.Charts?.length === 0 && (
          <MenuItem onClick={() => createChartingNote.dialog.handleOpen(appointment.id)}>
            Create Chart
          </MenuItem>
        )}
        {!appointment.invoice_id && (
          <MenuItem onClick={handleCreateInvoice}>Create invoice</MenuItem>
        )}
      </Menu>

      <CustomerNewChartingNoteModal
        patientId={appointment.user_id}
        open={createChartingNote.dialog.open}
        handleClose={createChartingNote.dialog.handleClose}
        isLoading={createChartingNote.isLoading}
        onSubmit={(data: CreateChartInput) => {
          handleClose();
          createChartingNote.handleSubmit(data);
        }}
        consultationId={appointment.id}
      />
    </>
  );
}
