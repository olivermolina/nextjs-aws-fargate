import type { FC } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import CalendarIcon from '@untitled-ui/icons-react/build/esm/Calendar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { paths } from '../../../paths';
import { useRouter } from '../../../hooks/use-router';

type Event = {
  id: string;
  createdAt: Date;
  description: string;
  title: string;
};

interface OverviewEventsProps {
  events: Event[];
  isLoading: boolean;
}

export const OverviewEvents: FC<OverviewEventsProps> = (props) => {
  const { events, isLoading } = props;

  const router = useRouter();
  const onItemClick = (event: Event) => {
    router.push(paths.dashboard.calendar + `?id=${event.id}`);
  };

  return (
    <Card>
      <CardHeader title="Upcoming events" />
      <CardContent sx={{ pt: 0 }}>
        <List disablePadding>
          {isLoading && events.length === 0 && (
            <Typography
              color="textSecondary"
              sx={{ px: 3, py: 2 }}
              variant="subtitle2"
            >
              Loading...
            </Typography>
          )}

          {!isLoading && events.length === 0 && (
            <Typography
              color="textSecondary"
              sx={{ px: 3, py: 2 }}
              variant="subtitle2"
            >
              There are no upcoming events
            </Typography>
          )}

          {events.map((event) => {
            const createdAtMonth = format(event.createdAt, 'LLL').toUpperCase();
            const createdAtDay = format(event.createdAt, 'd');

            return (
              <ListItem
                disableGutters
                key={event.id}
                onClick={() => onItemClick(event)}
                sx={{
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    cursor: 'pointer',
                  },
                }}
              >
                <ListItemAvatar>
                  <Box
                    sx={{
                      p: 1,
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.100',
                      borderRadius: 2,
                      maxWidth: 'fit-content',
                    }}
                  >
                    <Typography
                      align="center"
                      color="text.primary"
                      variant="caption"
                    >
                      {createdAtMonth}
                    </Typography>
                    <Typography
                      align="center"
                      color="text.primary"
                      variant="h6"
                    >
                      {createdAtDay}
                    </Typography>
                  </Box>
                </ListItemAvatar>
                <ListItemText>
                  <Typography variant="subtitle2">{event.title}</Typography>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                  >
                    {event.description}
                  </Typography>
                </ListItemText>
                <ListItemSecondaryAction>
                  <IconButton color="inherit">
                    <SvgIcon fontSize="small">
                      <CalendarIcon />
                    </SvgIcon>
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
      </CardContent>
      <Divider />
      <CardActions>
        <Button
          color="inherit"
          endIcon={
            <SvgIcon>
              <ArrowRightIcon />
            </SvgIcon>
          }
          size="small"
          href={paths.dashboard.calendar}
        >
          See all
        </Button>
      </CardActions>
    </Card>
  );
};

OverviewEvents.propTypes = {
  events: PropTypes.array.isRequired,
};
