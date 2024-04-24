import Typography from '@mui/material/Typography';
import { History, HistoryType, Relationship } from '@prisma/client';
import React, { useMemo } from 'react';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import CustomerProfileHistoryItem from './customer-profile-history-item';
import Select from '@mui/material/Select';
import { MenuItem } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { HistoryInput } from '../../../utils/zod-schemas/history';

type Props = {
  userId: string;
  histories: History[];
  onAddNew?: (type: HistoryType, relationship?: Relationship) => void;
  editHistory?: HistoryInput | null;
  onEdit?: (history: HistoryInput | null) => void;
};

function CustomerProfileFamilyHistoryItem(props: Props) {
  const { histories, userId, editHistory, onEdit } = props;

  const groupByRelationship = useMemo(() => {
    return histories.reduce(
      (acc, history) => {
        if (!acc[history.relationship!]) {
          acc[history.relationship!] = [];
        }
        acc[history.relationship!].push(history);
        return acc;
      },
      {} as Record<Relationship, History[]>,
    );
  }, [histories]);

  const options = useMemo(() => {
    const allRelationships = Object.values(Relationship);
    const existingRelationships = Object.keys(groupByRelationship);
    // Filter out existing relationships from all relationships
    return allRelationships.filter((r) => !existingRelationships.includes(r));
  }, [groupByRelationship]);

  return (
    <Stack
      spacing={1}
      justifyContent={'justify-start'}
      sx={{
        width: '100%',
      }}
    >
      {Object.entries(groupByRelationship).map(([relationship, histories]) => (
        <Stack
          key={relationship}
          spacing={1}
          direction={'row'}
          sx={{
            width: '100%',
          }}
        >
          <Typography
            sx={{
              textTransform: 'capitalize',
              width: 100,
            }}
            variant={'subtitle2'}
          >
            {relationship.replaceAll('_', ' ').toLowerCase()}
          </Typography>
          <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
            {histories?.map((history) => (
              <CustomerProfileHistoryItem
                key={history.id}
                history={history}
                userId={userId}
                editHistory={editHistory}
                onEdit={onEdit}
                placeholder={`add ${relationship
                  .replaceAll('_', ' ')
                  .toLowerCase()} family history`}
              />
            ))}

            {/* New item history*/}
            {((histories.length === 1 && histories[0].condition !== '') ||
              histories.length > 1) && (
              <CustomerProfileHistoryItem
                userId={userId}
                history={{
                  id: 'new',
                  user_id: userId,
                  condition: '',
                  type: HistoryType.FAMILY_HISTORY,
                  relationship: relationship as Relationship,
                  created_at: new Date(),
                  updated_at: new Date(),
                }}
                editHistory={editHistory}
                onEdit={onEdit}
                placeholder={`add ${relationship
                  .replaceAll('_', ' ')
                  .toLowerCase()} family history`}
              />
            )}
          </List>
        </Stack>
      ))}

      {options.length > 0 && (
        <FormControl
          fullWidth
          sx={{ mb: 1 }}
        >
          <InputLabel id="select-realationship-patient">Add relationship to patient</InputLabel>
          <Select
            labelId="select-realationship-patient"
            label={'Add relationship to patient'}
            fullWidth
            size={'small'}
            variant={'outlined'}
            renderValue={(value: string | null) => (
              <Typography sx={{ textTransform: 'capitalize' }}>
                {value?.replaceAll('_', ' ').toLowerCase()}{' '}
              </Typography>
            )}
            value={''}
            onChange={(event) => {
              const relationship = event.target.value as Relationship;
              props.onAddNew?.(HistoryType.FAMILY_HISTORY, relationship);
            }}
          >
            {options.map((option) => (
              <MenuItem
                key={option}
                value={option}
                sx={{
                  textTransform: 'capitalize',
                }}
              >
                {option.replaceAll('_', ' ').toLowerCase()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Stack>
  );
}

export default React.memo(CustomerProfileFamilyHistoryItem);
