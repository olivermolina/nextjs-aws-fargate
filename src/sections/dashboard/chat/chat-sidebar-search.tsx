import React, { ChangeEvent, FocusEvent, forwardRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import SearchMdIcon from '@untitled-ui/icons-react/build/esm/SearchMd';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import OutlinedInput from '@mui/material/OutlinedInput';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';

import { Tip } from 'src/components/tip';
import type { Contact } from 'src/types/chat';
import UserAvatar from '../../../components/user-avatar';

interface ChatSidebarSearchProps {
  isFocused?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onClickAway?: () => void;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onSelect?: (result: Contact) => void;
  query?: string;
  results?: Contact[];
}

export const ChatSidebarSearch = forwardRef<HTMLDivElement, ChatSidebarSearchProps>(
  function ChatSidebarSearch(props, ref) {
    const {
      isFocused,
      onChange,
      onClickAway = () => {},
      onFocus,
      onSelect,
      query = '',
      results = [],
      ...other
    } = props;

    const handleSelect = useCallback(
      (result: Contact): void => {
        onSelect?.(result);
      },
      [onSelect]
    );

    const showTip = isFocused && !query;
    const showResults = isFocused && query;
    const hasResults = results.length > 0;

    return (
      <ClickAwayListener onClickAway={onClickAway}>
        <Box
          ref={ref}
          sx={{ p: 2 }}
          {...other}
        >
          <OutlinedInput
            fullWidth
            onChange={onChange}
            onFocus={onFocus}
            placeholder="Search contacts"
            startAdornment={
              <InputAdornment position="start">
                <SvgIcon>
                  <SearchMdIcon />
                </SvgIcon>
              </InputAdornment>
            }
            value={query}
          />
          {showTip && (
            <Box sx={{ py: 2 }}>
              <Tip message="Enter a contact name" />
            </Box>
          )}
          {showResults && (
            <>
              {hasResults ? (
                <Box sx={{ py: 2 }}>
                  <Typography
                    color="text.secondary"
                    variant="subtitle2"
                  >
                    Contacts
                  </Typography>
                  <List>
                    {results.map((contact) => (
                      <ListItemButton
                        key={contact.id}
                        onClick={(): void => handleSelect(contact)}
                      >
                        <ListItemAvatar>
                          <UserAvatar
                            userId={contact.id}
                            height={32}
                            width={32}
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
                </Box>
              ) : (
                <Box sx={{ py: 2 }}>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                  >
                    We couldn&apos;t find any matches for &quot;{query}&quot;. Try checking for
                    typos or using complete words.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </ClickAwayListener>
    );
  }
);

// @ts-ignore
ChatSidebarSearch.propTypes = {
  isFocused: PropTypes.bool,
  onChange: PropTypes.func,
  onClickAway: PropTypes.func,
  onFocus: PropTypes.func,
  onSelect: PropTypes.func,
  query: PropTypes.string,
  results: PropTypes.array,
};
