import type { FC } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import AddressForm from '../../components/address/address-form';
import { useAddressDetails } from 'src/hooks/use-address-details';
import AddressListView from 'src/sections/components/address/address-list-view';
import { PatientWithInvoices } from 'src/types/patient';

interface CustomerBasicDetailsProps {
  title?: string;
  customer: PatientWithInvoices;
  isBilling?: boolean;
  hasEditAccess?: boolean;
}

export const CustomerAddressDetails: FC<CustomerBasicDetailsProps> = (props) => {
  const { title = 'Address Details', isBilling, hasEditAccess } = props;
  const addressDetails = useAddressDetails(props.customer?.id || '', isBilling);

  return (
    <Card>
      <CardHeader
        title={title}
        action={
          hasEditAccess && (
            <Button
              color="inherit"
              size="small"
              onClick={addressDetails.onCancel}
            >
              {addressDetails.edit ? 'Cancel' : 'Edit'}
            </Button>
          )
        }
      />
      {addressDetails.edit ? (
        <AddressForm
          {...addressDetails}
          isBilling={isBilling}
        />
      ) : (
        <AddressListView
          bill_name={addressDetails?.user?.bill_name || ''}
          address={
            (isBilling ? addressDetails.user?.billing_address : addressDetails.user?.address) || {}
          }
          align={'vertical'}
          isBilling={isBilling}
        />
      )}
    </Card>
  );
};
