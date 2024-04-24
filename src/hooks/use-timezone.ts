import { allTimezones, useTimezoneSelect } from 'react-timezone-select';

const timezones = {
  ...allTimezones,
  'Asia/Manila': 'Manila',
};

export const useTimezone = () => {
  const { parseTimezone } = useTimezoneSelect({
    labelStyle: 'original',
    timezones,
  });

  return {
    value: parseTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone).value,
    label: parseTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone).label,
  };
};
