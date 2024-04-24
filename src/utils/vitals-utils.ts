export const mapHeightCountryUnit = (country?: string | null) => {
  if (country === 'US') {
    return 'ft';
  }
  return 'cm';
};

export const mapWeightCountryUnit = (country?: string | null) => {
  if (country === 'US') {
    return 'lbs';
  }
  return 'kg';
};

export const mapTemperatureCountryUnit = (country?: string | null) => {
  if (country === 'US') {
    return '\u00B0F';
  }
  return '\u00B0C';
};
export const mapBMIUnit = (country?: string | null) => {
  if (country === 'US') {
    return 'lbs/ft²';
  }
  return 'kg/m²';
};
