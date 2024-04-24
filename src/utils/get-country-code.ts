export const getCountryFaxCode = (country: string) => {
  switch (country) {
    case 'MX':
      return '52';
    default:
      return '1';
  }
};
