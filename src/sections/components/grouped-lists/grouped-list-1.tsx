import type { FC } from 'react';
import { formatDistanceToNowStrict, subHours, subMinutes } from 'date-fns';
import DotsHorizontalIcon from '@untitled-ui/icons-react/build/esm/DotsHorizontal';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

const now = new Date();

interface Activity {
  id: string;
  createdAt: number;
  customer: {
    id: string;
    avatar: string;
    name: string;
  };
  description: string;
  type: string;
}

const activities: Activity[] = [
  {
    id: '5e89140bcc768199d1e0dc49',
    createdAt: subMinutes(now, 23).getTime(),
    customer: {
      id: '5e887a62195cc5aef7e8ca5d',
      avatar: '/assets/avatars/avatar-marcus-finn.png',
      name: 'Marcus Finn',
    },
    description: 'Created account',
    type: 'register',
  },
  {
    id: '5e891411b0290b175166cd32',
    createdAt: subMinutes(now, 56).getTime(),
    customer: {
      id: '5e887ac47eed253091be10cb',
      avatar: '/assets/avatars/avatar-carson-darrin.png',
      name: 'Carson Darrin',
    },
    description: 'Subscription Purchase',
    type: 'payment',
  },
  {
    id: '5e89141633dc5e52c923ef27',
    createdAt: subHours(now, 2).getTime(),
    customer: {
      id: '5e887b209c28ac3dd97f6db5',
      avatar: '/assets/avatars/avatar-fran-perez.png',
      name: 'Fran Perez',
    },
    description: 'Submitted a ticket',
    type: 'ticket_create',
  },
  {
    id: '5e89141bd975c7f33aee9f4b',
    createdAt: subMinutes(now, 5).getTime(),
    customer: {
      id: '5e887b7602bdbc4dbb234b27',
      avatar: '/assets/avatars/avatar-jie-yan-song.png',
      name: 'Jie Yan Song',
    },
    description: 'Subscription Purchase',
    type: 'payment',
  },
  {
    id: '5e891421d7945778863cf9ca',
    createdAt: subMinutes(now, 5).getTime(),
    customer: {
      id: '5e86809283e28b96d2d38537',
      avatar: '/assets/avatars/avatar-anika-visser.png',
      name: 'Anika Visser',
    },
    description: 'Subscription Purchase',
    type: 'payment',
  },
];

export const GroupedList1: FC = () => (
  <Box
    sx={{
      backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.100'),
      p: 3,
    }}
  >
    <Container maxWidth="sm">
      <Card>
        <CardHeader
          action={
            <IconButton>
              <SvgIcon>
                <DotsHorizontalIcon />
              </SvgIcon>
            </IconButton>
          }
          title="Activity"
        />
        <Divider />
        <Box sx={{ display: 'flex' }}>
          <Box
            sx={{
              p: 3,
              flexGrow: 1,
              '&:first-of-type': {
                borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              },
            }}
          >
            <Typography
              align="center"
              variant="h5"
            >
              15,245
            </Typography>
            <Typography
              align="center"
              color="text.secondary"
              component="h4"
              variant="overline"
            >
              Registered
            </Typography>
          </Box>
          <Box
            sx={{
              p: 3,
              flexGrow: 1,
              '&:first-of-type': {
                borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              },
            }}
          >
            <Typography
              align="center"
              variant="h5"
            >
              357
            </Typography>
            <Typography
              align="center"
              color="text.secondary"
              component="h4"
              variant="overline"
            >
              Online
            </Typography>
          </Box>
        </Box>
        <Divider />
        <List disablePadding>
          {activities.map((activity, index) => {
            const showDivider = index < activities.length - 1;
            const ago = formatDistanceToNowStrict(activity.createdAt);

            return (
              <ListItem
                divider={showDivider}
                key={activity.id}
              >
                <ListItemAvatar>
                  <Avatar
                    src={activity.customer.avatar}
                    sx={{ cursor: 'pointer' }}
                  />
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  primary={
                    <Link
                      color="text.primary"
                      sx={{ cursor: 'pointer' }}
                      underline="none"
                      variant="subtitle2"
                    >
                      {activity.customer.name}
                    </Link>
                  }
                  secondary={
                    <Typography
                      color="text.secondary"
                      variant="body2"
                    >
                      {activity.description}
                    </Typography>
                  }
                />
                <Typography
                  color="text.secondary"
                  noWrap
                  variant="caption"
                >
                  {ago} ago
                </Typography>
              </ListItem>
            );
          })}
        </List>
      </Card>
    </Container>
  </Box>
);
