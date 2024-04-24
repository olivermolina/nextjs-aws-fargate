import type { ChangeEvent, FC } from 'react';
import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import PlusIcon from '@untitled-ui/icons-react/build/esm/Plus';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { Theme } from '@mui/material/styles/createTheme';
import { Scrollbar } from 'src/components/scrollbar';
import { useRouter } from 'src/hooks/use-router';
import { paths } from 'src/paths';
import { useSelector } from 'src/store';
import type { Contact, Thread } from 'src/types/chat';

import { ChatSidebarSearch } from './chat-sidebar-search';
import { ChatThreadItem } from './chat-thread-item';
import { trpc } from '../../../app/_trpc/client';
import { deepCopy } from '../../../utils/deep-copy';
import { useAuth } from '../../../hooks/use-auth';
import { AuthContextType } from '../../../contexts/auth/jwt';
import { UserType } from '@prisma/client';

const useThreads = (): {
  byId: Record<string, Thread>;
  allIds: string[],
  onlineUserIds: string[]
} => {
  return useSelector((state) => state.chat.threads);
};

const useCurrentThreadId = (): string | undefined => {
  return useSelector((state) => state.chat.currentThreadId);
};

interface ChatSidebarProps {
  container?: HTMLDivElement | null;
  onClose?: () => void;
  open?: boolean;
}

export const ChatSidebar: FC<ChatSidebarProps> = (props) => {
  const { container, onClose, open, ...other } = props;
  const { user } = useAuth<AuthContextType>();
  const router = useRouter();
  const threads = useThreads();
  const currentThreadId = useCurrentThreadId();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
  const { data: contacts } = trpc.chat.getContacts.useQuery();

  const handleCompose = useCallback((): void => {
    router.push(paths.dashboard.chat + '?compose=true');
  }, [router]);

  const handleSearchChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
      const { value } = event.target;

      setSearchQuery(value);

      if (!value) {
        setSearchResults([]);
        return;
      }

      try {
        let foundContacts = contacts || [];

        if (value) {
          const cleanQuery = value.toLowerCase().trim();
          foundContacts = foundContacts.filter((contact) =>
            contact.name.toLowerCase().includes(cleanQuery)
          );
        }

        setSearchResults(deepCopy(foundContacts));
      } catch (err) {
        console.error(err);
      }
    },
    [contacts]
  );

  const handleSearchClickAway = useCallback((): void => {
    if (searchFocused) {
      setSearchFocused(false);
      setSearchQuery('');
    }
  }, [searchFocused]);

  const handleSearchFocus = useCallback((): void => {
    setSearchFocused(true);
  }, []);

  const handleSearchSelect = useCallback(
    (contact: Contact): void => {
      // We use the contact ID as a thread key
      const threadKey = contact.id;

      setSearchFocused(false);
      setSearchQuery('');

      router.push(paths.dashboard.chat + `?threadKey=${threadKey}`);
    },
    [router]
  );

  const handleThreadSelect = useCallback(
    (threadId: string): void => {
      const thread = threads.byId[threadId];
      const threadKey = thread.id;
      const chatRoute = user?.type === UserType.STAFF ? paths.dashboard.chat : paths.patient.chat;

      if (!threadKey) {
        router.push(chatRoute);
      } else {
        router.push(chatRoute + `?threadKey=${threadKey}`);
      }
    },
    [router, threads, user]
  );

  const content = (
    <div>
      <Stack
        alignItems="center"
        direction="row"
        spacing={2}
        sx={{ p: 2 }}
      >
        <Typography
          variant="h5"
          sx={{ flexGrow: 1 }}
        >
          Chats
        </Typography>
        {user?.type === UserType.STAFF && (
          <Button
            onClick={handleCompose}
            startIcon={
              <SvgIcon>
                <PlusIcon />
              </SvgIcon>
            }
            variant="contained"
          >
            Group
          </Button>
        )}

        {!mdUp && (
          <IconButton onClick={onClose}>
            <SvgIcon>
              <XIcon />
            </SvgIcon>
          </IconButton>
        )}
      </Stack>
      <ChatSidebarSearch
        isFocused={searchFocused}
        onChange={handleSearchChange}
        onClickAway={handleSearchClickAway}
        onFocus={handleSearchFocus}
        onSelect={handleSearchSelect}
        query={searchQuery}
        results={searchResults}
      />
      <Box sx={{ display: searchFocused ? 'none' : 'block' }}>
        <Scrollbar>
          <Stack
            component="ul"
            spacing={0.5}
            sx={{
              listStyle: 'none',
              m: 0,
              p: 2,
            }}
          >
            {threads.allIds.map((threadId) => (
              <ChatThreadItem
                active={currentThreadId === threadId}
                key={threadId}
                onSelect={(): void => handleThreadSelect(threadId)}
                thread={threads.byId[threadId]}
                onlineUserIds={threads.onlineUserIds}
              />
            ))}
          </Stack>
        </Scrollbar>
      </Box>
    </div>
  );

  if (mdUp) {
    return (
      <Drawer
        anchor="left"
        open={open}
        PaperProps={{
          sx: {
            position: 'relative',
            width: 380,
          },
        }}
        SlideProps={{ container }}
        variant="persistent"
        {...other}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      hideBackdrop
      ModalProps={{
        container,
        sx: {
          pointerEvents: 'none',
          position: 'absolute',
        },
      }}
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          maxWidth: '100%',
          width: 380,
          pointerEvents: 'auto',
          position: 'absolute',
        },
      }}
      SlideProps={{ container }}
      variant="temporary"
      {...other}
    >
      {content}
    </Drawer>
  );
};

ChatSidebar.propTypes = {
  container: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
