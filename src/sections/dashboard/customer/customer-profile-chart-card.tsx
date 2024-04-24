import { Address, Chart, Organization, User } from '@prisma/client';
import React, { useState } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getUserFullName } from '../../../utils/get-user-full-name';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import CardActions from '@mui/material/CardActions';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ExpandMore } from './customer-profile-consultation-card';
import EventNoteIcon from '@mui/icons-material/EventNote';
import dayjs from 'dayjs';
import { useUpdateSearchParams } from '../../../hooks/use-update-search-params';
import UserAvatar from '../../../components/user-avatar';
import { ChartCardContent } from './customer-profile-chart-card-content';
import { useRouter } from '../../../hooks/use-router';
import { useGenerateChartPdf } from '../../../hooks/use-generate-chart-pdf';
import BackdropLoading from '../account/account-billing-reactivate-backdrop';

export type CustomerProfileChartCardProps = {
  chart: Chart & {
    signed_by: User | null;
    user: User & {
      address: Address | null;
    };
    created_by: User;
  };
  organization?: Organization & {
    address: Address | null;
  };
  logo?: string;
};

const CustomerProfileChartCard = ({ chart }: CustomerProfileChartCardProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [expanded, setExpanded] = React.useState(false);
  const { replaceSearchParams } = useUpdateSearchParams();
  const router = useRouter();
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleViewChart = () => {
    replaceSearchParams({ tab: 'profile', chartId: chart.id });
  };

  const { generateChartPdf, isLoading } = useGenerateChartPdf(chart.id);

  return (
    <>
      <Card
        raised
        sx={{ mr: 2, width: 'auto', mb: 2 }}
      >
        <CardHeader
          avatar={
            <EventNoteIcon sx={{ color: 'grey.400' }} /> // Using the document icon
          }
          action={
            <IconButton
              aria-label="file-menu"
              onClick={handleClick}
            >
              <MoreVertIcon />
            </IconButton>
          }
          title={chart.name}
          subheader={`${dayjs(chart.created_at).format('dddd, MMMM D, YYYY hh:mm A')}`}
          titleTypographyProps={{ variant: 'subtitle1' }}
          subheaderTypographyProps={{ color: 'textSecondary' }}
          sx={{
            px: 4,
            pb: 0,
            '& .MuiCardHeader-action': { mt: '0' },
          }}
        />
        <CardContent
          sx={{
            px: 4,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 600 }}
          >
            By {getUserFullName(chart.created_by)}
          </Typography>
        </CardContent>
        <CardActions sx={{ mx: 2, justifyContent: 'space-between' }}>
          <Stack spacing={1}>
            <UserAvatar userId={chart.created_by.id} />
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
          <Stack spacing={1}>
            <ChartCardContent chart={chart} />
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
        <MenuItem onClick={handleViewChart}>
          <Link
            onClick={handleViewChart}
            sx={{
              alignItems: 'center',
              display: 'inline-flex',
            }}
            underline="none"
            color={'inherit'}
          >
            View
          </Link>
        </MenuItem>
        <MenuItem
          onClick={() => {
            generateChartPdf();
            handleClose();
          }}
        >
          Generate PDF
        </MenuItem>
      </Menu>
      <BackdropLoading
        open={isLoading}
        message="Generating Chart PDF..."
      />
    </>
  );
};

export default CustomerProfileChartCard;
