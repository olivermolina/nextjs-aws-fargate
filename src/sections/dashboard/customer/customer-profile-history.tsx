import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { ConfigureClinicalProfile, History, HistoryType, Relationship } from '@prisma/client';
import { trpc } from '../../../app/_trpc/client';
import { Skeleton } from '@mui/material';
import React, { useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import { HistoryInput } from '../../../utils/zod-schemas/history';
import CustomerProfileHistoryItem from './customer-profile-history-item';
import CustomerProfileFamilyHistoryItem from './customer-profile-family-history-item';
import Divider from '@mui/material/Divider';
import { useSaveHistory } from '../../../hooks/use-save-history';

type Props = {
  id: string;
  settings?: ConfigureClinicalProfile;
};

function CustomerProfileHistory(props: Props) {
  const { id, settings } = props;
  const [editHistory, setEditHistory] = useState<HistoryInput | null>(null);

  const { data: histories, isLoading } = trpc.history.list.useQuery(
    {
      userId: id,
    },
    {
      refetchOnWindowFocus: false,
    }
  );
  const saveHistory = useSaveHistory(id, false);
  const handleAddNew = async (type: HistoryType, relationship?: Relationship) => {
    const historyInput: HistoryInput = {
      id: 'new',
      user_id: id,
      condition: '',
      type,
      relationship,
    };
    await saveHistory.onSubmit(historyInput, setEditHistory);
  };

  const onEdit = (history: HistoryInput | null) => {
    setEditHistory(history);
  };

  const groupHistoryByType = useMemo(() => {
    return Object.values(HistoryType).reduce(
      (acc, type) => {
        // Skip if not in settings
        if (!settings?.history_subsections.includes(type.toLowerCase())) {
          return acc;
        }

        const filtered = histories?.filter((history) => history.type === type);
        return {
          ...acc,
          [type]: filtered,
        };
      },
      {} as Record<HistoryType, History[]>,
    );
  }, [histories, settings]);

  if (isLoading) {
    return (
      <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
        {Array.from({ length: 3 }).map((i, index) => (
          <ListItem
            key={index}
            disableGutters
          >
            <Typography
              variant="caption"
              sx={{ color: 'error.main', width: '100%' }}
            >
              <Skeleton />
            </Typography>
          </ListItem>
        ))}
      </List>
    );
  }

  return (
    <Stack
      spacing={2}
      justifyContent={'justify-start'}
    >
      {Object.entries(groupHistoryByType).map(([type, historiesByType]) => (
        <Stack
          key={type}
          spacing={1}
        >
          <Typography
            sx={{
              textTransform: 'capitalize',
            }}
            color={'text.secondary'}
            variant={'h6'}
          >
            {type.replaceAll('_', ' ').toLowerCase()}
          </Typography>
          <Divider />

          {type === HistoryType.FAMILY_HISTORY ? (
            <CustomerProfileFamilyHistoryItem
              userId={id}
              histories={historiesByType}
              onAddNew={handleAddNew}
              editHistory={editHistory}
              onEdit={onEdit}
            />
          ) : (
            <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
              {historiesByType?.map((history) => (
                <CustomerProfileHistoryItem
                  userId={id}
                  key={history.id}
                  history={history}
                  editHistory={editHistory}
                  onEdit={onEdit}
                />
              ))}
              {/* New item history*/}
              <CustomerProfileHistoryItem
                userId={id}
                history={{
                  id: 'new',
                  user_id: id,
                  condition: '',
                  type: type as HistoryType,
                  relationship: null,
                  created_at: new Date(),
                  updated_at: new Date(),
                }}
                editHistory={editHistory}
                onEdit={onEdit}
                placeholder={`add ${type.replaceAll('_', ' ').toLowerCase()}`}
              />
            </List>
          )}
        </Stack>
      ))}
    </Stack>
  );
}

export default React.memo(CustomerProfileHistory);
