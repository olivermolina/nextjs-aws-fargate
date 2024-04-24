import React, { ChangeEvent, FC, useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import OutlinedInput from '@mui/material/OutlinedInput';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';
import type { Contact } from 'src/types/chat';
import { trpc } from '../../../app/_trpc/client';
import { Prisma, RolePermissionLevel, UserType } from '@prisma/client';
import { getUserFullName } from '../../../utils/get-user-full-name';
import { useGetPermissionByResource } from '../../../hooks/use-get-permission-by-resource';
import { PermissionResourceEnum } from '../../../hooks/use-role-permissions';
import { deepCopy } from '../../../utils/deep-copy';
import UserAvatar from '../../../components/user-avatar';

interface ChatComposerRecipientsProps {
  onRecipientAdd?: (contact: Contact) => void;
  onRecipientRemove?: (recipientId: string) => void;
  recipients?: Contact[];
}

export const ChatComposerRecipients: FC<ChatComposerRecipientsProps> = (props) => {
  const { onRecipientAdd, onRecipientRemove, recipients = [], ...other } = props;
  const searchRef = useRef<HTMLDivElement | null>(null);
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const permission = useGetPermissionByResource(PermissionResourceEnum.CHAT);
  const { data: patients } = trpc.user.list.useQuery({
      type: [UserType.PATIENT],
      sortDir: Prisma.SortOrder.asc,
      assigned: permission?.editAccessLevel === RolePermissionLevel.OWN ? true : undefined,
    },
    {
      refetchOnWindowFocus: false,
    });

  const showSearchResults = !!(searchFocused && searchQuery);
  const hasSearchResults = searchResults.length > 0;

  const handleSearchChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
      const query = event.target.value;

      setSearchQuery(query);

      if (!query) {
        setSearchResults([]);
        return;
      }

      try {
        const contacts =
          patients?.items?.map(
            (user) =>
              ({
                id: user.id,
                name: getUserFullName(user),
                avatar: user.avatar,
              }) as Contact,
          ) || [];

        let foundContacts = contacts || [];
        const cleanQuery = query.toLowerCase().trim();
        foundContacts = foundContacts.filter((contact) =>
          contact.name.toLowerCase().includes(cleanQuery),
        );

        setSearchResults(deepCopy(foundContacts));
      } catch (err) {
        console.error(err);
      }
    },
    [patients],
  );

  const handleSearchClickAway = useCallback((): void => {
    if (showSearchResults) {
      setSearchFocused(false);
    }
  }, [showSearchResults]);

  const handleSearchFocus = useCallback((): void => {
    setSearchFocused(true);
  }, []);

  const handleSearchSelect = useCallback(
    (contact: Contact): void => {
      setSearchQuery('');
      onRecipientAdd?.(contact);
    },
    [onRecipientAdd],
  );

  return (
    <>
      <Box {...other}>
        <Scrollbar>
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              p: 2,
            }}
          >
            <ClickAwayListener onClickAway={handleSearchClickAway}>
              <Box sx={{ mr: 1 }}>
                <OutlinedInput
                  fullWidth
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  placeholder="Search contacts"
                  ref={searchRef}
                  startAdornment={
                    <InputAdornment position="start">
                      <SvgIcon>
                        <SearchMdIcon />
                      </SvgIcon>
                    </InputAdornment>
                  }
                  sx={{
                    '&.MuiInputBase-root': {
                      height: 40,
                      minWidth: 260,
                    },
                  }}
                  value={searchQuery}
                  disabled={recipients?.length > 0}
                />
                {showSearchResults && (
                  <Popper
                    anchorEl={searchRef.current}
                    open={searchFocused}
                    placement="bottom-start"
                  >
                    <Paper
                      elevation={16}
                      sx={{
                        borderColor: 'divider',
                        borderStyle: 'solid',
                        borderWidth: 1,
                        maxWidth: '100%',
                        mt: 1,
                        width: 320,
                      }}
                    >
                      {hasSearchResults ? (
                        <>
                          <Box
                            sx={{
                              px: 2,
                              pt: 2,
                            }}
                          >
                            <Typography
                              color="text.secondary"
                              variant="subtitle2"
                            >
                              Contacts
                            </Typography>
                          </Box>
                          <List>
                            {searchResults.map((contact) => (
                              <ListItemButton
                                key={contact.id}
                                onClick={(): void => handleSearchSelect(contact)}
                              >
                                <ListItemAvatar>
                                  <UserAvatar
                                    userId={contact?.id}
                                    height={40}
                                    width={40}
                                  />
                                </ListItemAvatar>
                                <ListItemText
                                  primary={contact.name}
                                  primaryTypographyProps={{
                                    noWrap: true,
                                    variant: 'subtitle2',
                                  }}
                                />
                              </ListItemButton>
                            ))}
                          </List>
                        </>
                      ) : (
                        <Box
                          sx={{
                            p: 2,
                            textAlign: 'center',
                          }}
                        >
                          <Typography
                            gutterBottom
                            variant="h6"
                          >
                            Nothing Found
                          </Typography>
                          <Typography
                            color="text.secondary"
                            variant="body2"
                          >
                            We couldn&apos;t find any matches for &quot;{searchQuery}&quot;. Try
                            checking for typos or using complete words.
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Popper>
                )}
              </Box>
            </ClickAwayListener>
            <Typography
              color="text.secondary"
              sx={{ mr: 2 }}
              variant="body2"
            >
              To:
            </Typography>
            <Stack
              alignItems="center"
              direction="row"
              spacing={2}
            >
              {recipients.map((recipient) => (
                <Chip
                  avatar={
                    <UserAvatar
                      userId={recipient.id}
                      height={40}
                      width={40}
                    />
                  }
                  key={recipient.id}
                  label={recipient.name}
                  onDelete={(): void => onRecipientRemove?.(recipient.id)}
                />
              ))}
            </Stack>
          </Box>
        </Scrollbar>
      </Box>
    </>
  );
};

ChatComposerRecipients.propTypes = {
  onRecipientAdd: PropTypes.func,
  onRecipientRemove: PropTypes.func,
  recipients: PropTypes.array,
};
