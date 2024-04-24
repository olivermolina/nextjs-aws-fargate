import React, { FC, useCallback, useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { trpc } from 'src/app/_trpc/client';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import { debounce } from 'lodash';
import toast from 'react-hot-toast';

type ListItemType = {
  key: string;
  label: string;
  value: boolean;
};

type ListType = ListItemType & {
  subsections?: ListItemType[];
};

export const AccountConfigureClinicalProfileCard: FC = () => {
  const { data, isLoading } = trpc.organization.getConfigureClinicalProfile.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const [configureClinicalProfile, setConfigureClinicalProfile] = useState<ListType[] | null>(null);

  const mutate = trpc.organization.saveConfigureClinicalProfile.useMutation();
  const saveConfigureClinicalProfile = debounce(async (updatedSettings: ListType[]) => {
    try {
      await mutate.mutateAsync({
        quick_notes: updatedSettings.find((item) => item.key === 'quick_notes')?.value || false,
        allergies: updatedSettings.find((item) => item.key === 'allergies')?.value || false,
        problems: updatedSettings.find((item) => item.key === 'problems')?.value || false,
        medications: updatedSettings.find((item) => item.key === 'medications')?.value || false,
        vitals: updatedSettings.find((item) => item.key === 'vitals')?.value || false,
        vitals_subsections:
          updatedSettings
            .find((item) => item.key === 'vitals')
            ?.subsections?.filter((subItem) => subItem.value)
            .map((subItem) => subItem.key) || [],
        history: updatedSettings.find((item) => item.key === 'history')?.value || false,
        history_subsections:
          updatedSettings
            .find((item) => item.key === 'history')
            ?.subsections?.filter((subItem) => subItem.value)
            .map((subItem) => subItem.key) || [],
      });
      toast.success('Clinical profile settings saved successfully', {
        id: 'clinical-profile-settings-saved-successfully',
      });
    } catch (e) {
      toast.error(e.message);
    }
  }, 1000); // 500ms delay

  const onChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      saveConfigureClinicalProfile.cancel(); // Cancel the previous debounce
      const { name, checked } = event.target;
      if (configureClinicalProfile) {
        const updated = configureClinicalProfile.map((item) => {
          if (item.key === name) {
            return {
              ...item,
              value: checked,
            };
          }

          if (item.subsections) {
            return {
              ...item,
              subsections: item.subsections.map((subItem) => {
                if (subItem.key === name) {
                  return {
                    ...subItem,
                    value: checked,
                  };
                }

                return subItem;
              }),
            };
          }

          return item;
        });
        setConfigureClinicalProfile(updated);
        saveConfigureClinicalProfile(updated);
      }
    },
    [saveConfigureClinicalProfile, configureClinicalProfile],
  );

  useEffect(() => {
    if (data) {
      setConfigureClinicalProfile([
        {
          key: 'quick_notes',
          label: 'Quick Notes',
          value: data?.quick_notes || false,
        },
        {
          key: 'vitals',
          label: 'Vitals',
          value: data?.vitals || false,
          subsections: [
            {
              key: 'height',
              label: 'Height',
              value: data?.vitals_subsections.includes('height') || false,
            },
            {
              key: 'weight',
              label: 'Weight',
              value: data?.vitals_subsections.includes('weight') || false,
            },
            {
              key: 'bmi',
              label: 'BMI',
              value: data?.vitals_subsections.includes('bmi') || false,
            },
            {
              key: 'blood_pressure',
              label: 'Blood Pressure',
              value: data?.vitals_subsections.includes('blood_pressure') || false,
            },
            {
              key: 'temperature',
              label: 'Temperature',
              value: data?.vitals_subsections.includes('temperature') || false,
            },
            {
              key: 'heart_rate',
              label: 'Heart Rate',
              value: data?.vitals_subsections.includes('heart_rate') || false,
            },
            {
              key: 'respiratory_rate',
              label: 'Respiratory Rate',
              value: data?.vitals_subsections.includes('respiratory_rate') || false,
            },
            {
              key: 'oxygen_saturation',
              label: 'Oxygen Saturation',
              value: data?.vitals_subsections.includes('oxygen_saturation') || false,
            },
          ],
        },
        {
          key: 'allergies',
          label: 'Allergies',
          value: data?.allergies || false,
        },
        {
          key: 'problems',
          label: 'Problem List',
          value: data?.problems || false,
        },
        {
          key: 'history',
          label: 'History',
          value: data?.history || false,
          subsections: [
            {
              key: 'family_history',
              label: 'Family History',
              value: data?.history_subsections.includes('family_history') || false,
            },
            {
              key: 'social_history',
              label: 'Social History',
              value: data?.history_subsections.includes('social_history') || false,
            },
            {
              key: 'past_medical_history',
              label: 'Past Medical History',
              value: data?.history_subsections.includes('past_medical_history') || false,
            },
            {
              key: 'past_surgical_history',
              label: 'Past Surgical History',
              value: data?.history_subsections.includes('past_surgical_history') || false,
            },
            {
              key: 'diet',
              label: 'Diet',
              value: data?.history_subsections.includes('diet') || false,
            },
            {
              key: 'habits',
              label: 'Habits',
              value: data?.history_subsections.includes('habits') || false,
            },
            {
              key: 'exercises',
              label: 'Exercises',
              value: data?.history_subsections.includes('exercises') || false,
            },
            {
              key: 'other',
              label: 'Other',
              value: data?.history_subsections.includes('other') || false,
            },
          ],
        },
        {
          key: 'medications',
          label: 'Medications',
          value: data?.medications || false,
        },
      ]);
    }
  }, [data]);

  return (
    <Card>
      <CardHeader title="Configure Clinical Profile" />
      <CardContent>
        {isLoading && <div>Loading...</div>}

        <FormGroup>
          {configureClinicalProfile?.map((item) => (
            <React.Fragment key={item.key}>
              <FormControlLabel
                control={
                  <Switch
                    name={item.key}
                    checked={item.value}
                    onChange={onChange}
                  />
                }
                label={item.label}
              />

              {item.subsections && (
                <FormGroup sx={{ marginLeft: 4 }}>
                  {item.subsections.map((subItem) => (
                    <FormControlLabel
                      key={subItem.key}
                      control={
                        <Checkbox
                          disabled={!item.value}
                          name={subItem.key}
                          checked={subItem.value}
                          onChange={onChange}
                        />
                      }
                      label={subItem.label}
                    />
                  ))}
                </FormGroup>
              )}
            </React.Fragment>
          ))}
        </FormGroup>
      </CardContent>
    </Card>
  );
};
