import { PropertyList } from 'src/components/property-list';
import { PropertyListItem } from 'src/components/property-list-item';

type AddressListViewProps = {
  bill_name?: string;
  bill_email?: string;
  address: {
    address_line1?: string | null;
    address_line2?: string | null;
    postal_code?: string | null;
    state?: string | null;
    city?: string | null;
    country?: string | null;
  };
  isBilling?: boolean;
  align?: 'horizontal' | 'vertical';
};

export default function AddressListView(props: AddressListViewProps) {
  const { isBilling, bill_name, bill_email, address, align = 'horizontal' } = props;

  return (
    <PropertyList>
      {isBilling && (
        <>
          <PropertyListItem
            align={align}
            divider
            label="Billing name"
            value={bill_name}
          />
          {bill_email && (
            <PropertyListItem
              align={align}
              divider
              label="Billing email"
              value={bill_email}
            />
          )}
        </>
      )}

      <PropertyListItem
        align={align}
        divider
        label="Address Line 1"
        value={address.address_line1 || ''}
      />
      <PropertyListItem
        align={align}
        divider
        label="Address Line 2"
        value={address.address_line2 || ''}
      />
      <PropertyListItem
        align={align}
        divider
        label="Zip / Postal code"
        value={address.postal_code || ''}
      />
      <PropertyListItem
        align={align}
        divider
        label="State"
        value={address.state || ''}
      />
      <PropertyListItem
        align={align}
        divider
        label="City"
        value={address.city || ''}
      />
      <PropertyListItem
        align={align}
        divider
        label="Country"
        value={address.country || ''}
      />
    </PropertyList>
  );
}
