interface Address {
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
}

export function extractFullAddress(fullAddress: string): Address {
  const addressComponents = fullAddress.split(',');
  const address = addressComponents[0].trim();
  const city = addressComponents[1].trim();
  const stateZip = addressComponents[2].trim().split(' ');
  const state = stateZip[0];
  const zip = stateZip[1];

  let address1 = '';
  let address2 = '';

  const addressParts = address.split(' ');
  if (addressParts.length > 3) {
    address1 = addressParts.slice(0, 3).join(' ');
    address2 = addressParts.slice(3).join(' ');
  } else {
    address1 = address;
  }

  return {
    address1,
    address2,
    city,
    state,
    zip,
  };
}
