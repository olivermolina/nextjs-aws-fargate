import React, { FC } from 'react';
import PropTypes from 'prop-types';
import { formatDistanceStrict } from 'date-fns';
import ArrowRightIcon from '@untitled-ui/icons-react/build/esm/ArrowRight';
import RefreshCcw01Icon from '@untitled-ui/icons-react/build/esm/RefreshCcw01';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

import { customLocale } from 'src/utils/date-locale';
import { Skeleton } from '@mui/material';
import { paths } from '../../../paths';
import UserAvatar from '../../../components/user-avatar';
import { useRouter } from '../../../hooks/use-router';

interface Message {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
  senderName: string;
  senderOnline?: boolean;
  threadId: string;
}

interface OverviewInboxProps {
  messages: Message[];
  isLoading?: boolean;
  handleRefresh: () => void;
}

export const OverviewInbox: FC<OverviewInboxProps> = (props) => {
  const { messages, isLoading, handleRefresh } = props;
  const router = useRouter();
  const onItemClick = (message: Message) => {
    const threadId = message.threadId;
    router.push(paths.dashboard.chat + `?threadKey=${threadId}`);
  };

  return (
    <Card>
      <CardHeader
        title="Inbox"
        action={
          <IconButton
            color="inherit"
            onClick={handleRefresh}
          >
            <SvgIcon fontSize="small">
              <RefreshCcw01Icon />
            </SvgIcon>
          </IconButton>
        }
      />
      <List disablePadding>
        {isLoading &&
          Array.from({ length: 5 }).map((i, index) => (
            <ListItem
              key={index}
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover',
                  cursor: 'pointer',
                },
              }}
            >
              <ListItemAvatar>
                <Skeleton
                  variant="circular"
                  height={40}
                  width={40}
                />
              </ListItemAvatar>
              <ListItemText
                disableTypography
                primary={
                  <Typography
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    variant="subtitle2"
                  >
                    <Skeleton
                      variant="text"
                      sx={{ fontSize: '1rem' }}
                      width={index % 2 === 0 ? '100%' : '80%'}
                    />
                  </Typography>
                }
                sx={{ pr: 2 }}
              />
              <Typography
                color="text.secondary"
                sx={{ whiteSpace: 'nowrap' }}
                variant="caption"
              >
                <Skeleton
                  variant="text"
                  width={25}
                />
              </Typography>
            </ListItem>
          ))}

        {!isLoading &&
          messages.map((message) => {
            const ago = formatDistanceStrict(message.createdAt, new Date(), {
              addSuffix: true,
              locale: customLocale,
            });

            return (
              <ListItem
                key={message.id}
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    cursor: 'pointer',
                  },
                }}
                onClick={() => onItemClick(message)}
              >
                <ListItemAvatar>
                  {message.senderOnline ? (
                    <Badge
                      anchorOrigin={{
                        horizontal: 'right',
                        vertical: 'bottom',
                      }}
                      color="success"
                      variant="dot"
                    >
                      <UserAvatar userId={message.senderId} />
                    </Badge>
                  ) : (
                    <UserAvatar userId={message.senderId} />
                  )}
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      variant="subtitle2"
                    >
                      {message.senderName}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      variant="body2"
                    >
                      {message.content}
                    </Typography>
                  }
                  sx={{ pr: 2 }}
                />
                <Typography
                  color="text.secondary"
                  sx={{ whiteSpace: 'nowrap' }}
                  variant="caption"
                >
                  {ago}
                </Typography>
              </ListItem>
            );
          })}
      </List>
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
          href={paths.dashboard.chat}
        >
          Go to chat
        </Button>
      </CardActions>
    </Card>
  );
};

OverviewInbox.propTypes = {
  messages: PropTypes.array.isRequired,
};
