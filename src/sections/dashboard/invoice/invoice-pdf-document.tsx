import { format } from 'date-fns';
import numeral from 'numeral';
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@joshuajaco/react-pdf-renderer-bundled';
import type { Invoice } from 'src/types/invoice';
import { Address, Organization, Tax } from '@prisma/client';
import { getUserFullName } from '../../../utils/get-user-full-name';
import { getBaseUrl } from '../../../utils/get-base-url';


interface InvoicePdfDocumentProps {
  invoice: Invoice;
  organization?: Organization & {
    billing_address: Address | null;
    Tax: Tax | null;
  };
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  h4: {
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.235,
  },
  h6: {
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.6,
  },
  alignRight: {
    textAlign: 'right',
  },
  subtitle2: {
    fontSize: 10,
    fontWeight: 500,
    lineHeight: 1.57,
  },
  body2: {
    fontSize: 10,
    fontWeight: 400,
    lineHeight: 1.43,
  },
  gutterBottom: {
    marginBottom: 4,
  },
  colorSuccess: {
    color: '#10b880',
  },
  uppercase: {
    textTransform: 'uppercase',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brand: {
    height: 24,
    width: 24,
  },
  company: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  references: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  billing: {
    marginTop: 32,
  },
  items: {
    marginTop: 32,
  },
  itemRow: {
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
    borderStyle: 'solid',
    flexDirection: 'row',
  },
  itemNumber: {
    padding: 6,
    width: '10%',
  },
  itemDescription: {
    padding: 6,
    width: '50%',
  },
  itemQty: {
    padding: 6,
    width: '10%',
  },
  itemUnitAmount: {
    padding: 6,
    width: '15%',
  },
  itemTotalAmount: {
    padding: 6,
    width: '15%',
  },
  summaryRow: {
    flexDirection: 'row',
  },
  summaryGap: {
    padding: 6,
    width: '70%',
  },
  summaryTitle: {
    padding: 6,
    width: '15%',
  },
  summaryValue: {
    padding: 6,
    width: '15%',
  },
  notes: {
    marginTop: 32,
  },
});

const BillingAddressView = ({ address }: { address?: Address | null }) => {

  if (!address) return null;

  return (
    <>
      {address.address_line1 && address.address_line2 ? (
        <Text style={styles.body2}>{address.address_line1}</Text>
      ) : (
        <Text style={styles.body2}>
          {address.address_line1}, ${address.postal_code}
        </Text>
      )}
      {address.address_line2 && (
        <Text style={styles.body2}>
          {address.address_line2}, {address.postal_code}
        </Text>
      )}
      {address.city && (
        <Text style={styles.body2}>
          {address.city} , {address.state}, {address.country}
        </Text>
      )}
    </>
  );
};

export const InvoicePdfDocument = (props: InvoicePdfDocumentProps) => {
  const { invoice, organization } = props;
  const currency = organization?.currency_symbol || '$';
  const items = invoice.InvoiceItems || [];
  const dueDate = invoice.due_date && format(invoice.due_date, 'dd MMM yyyy');
  const issueDate = invoice.created_at && format(invoice.created_at, 'dd MMM yyyy');
  const subtotalAmount = numeral(invoice.subtotal_amount).format(`${currency}0,0.00`);
  const taxAmount = numeral(invoice.tax_amount).format(`${currency}0,0.00`);
  const totalAmount = numeral(invoice.total_amount).format(`${currency}0,0.00`);
  const fullName = getUserFullName(invoice.patient);

  return (
    <Document>
      <Page
        size="A4"
        style={styles.page}
      >
        <View style={styles.header}>
          <View>
            <Image
              source={`${getBaseUrl()}/assets/logo.jpg`}
              style={styles.brand}
            />
            <Text style={styles.h6}>{organization?.website}</Text>
          </View>
          <View>
            <Text style={[styles.h4, styles.uppercase, styles.colorSuccess]}>{invoice.status}</Text>
            <Text style={styles.subtitle2}>{invoice.invoice_number}</Text>
          </View>
        </View>
        <View style={styles.company}>
          <View>
            <BillingAddressView address={organization?.billing_address} />
          </View>
          <View>
            <Text style={styles.body2}>Company No. {organization?.Tax?.company_number}</Text>
            <Text style={styles.body2}>EU VAT No. {organization?.Tax?.vat_number}</Text>
          </View>
          <View>
            <Text style={styles.body2}>{organization?.email}</Text>
            <Text style={styles.body2}>{organization?.phone}</Text>
          </View>
        </View>
        <View style={styles.references}>
          <View>
            <Text style={[styles.subtitle2, styles.gutterBottom]}>Due Date</Text>
            <Text style={styles.body2}>{dueDate}</Text>
          </View>
          <View>
            <Text style={[styles.subtitle2, styles.gutterBottom]}>Date of issue</Text>
            <Text style={styles.body2}>{issueDate}</Text>
          </View>
          <View>
            <Text style={[styles.subtitle2, styles.gutterBottom]}>Number</Text>
            <Text style={styles.body2}>{invoice.invoice_number}</Text>
          </View>
        </View>
        <View style={styles.billing}>
          <Text style={[styles.subtitle2, styles.gutterBottom]}>Billed to</Text>
          <Text style={styles.body2}>{fullName}</Text>
          {invoice.patient.company && <Text style={styles.body2}>{invoice.patient.company}</Text>}
          <Text style={styles.body2}>{invoice.patient.phone}</Text>
          <BillingAddressView address={invoice.patient.billing_address} />
        </View>
        <View style={styles.items}>
          <View style={styles.itemRow}>
            <View style={styles.itemNumber}>
              <Text style={styles.h6}>#</Text>
            </View>
            <View style={styles.itemDescription}>
              <Text style={styles.h6}>Description</Text>
            </View>
            <View style={styles.itemQty}>
              <Text style={styles.h6}>Qty</Text>
            </View>
            <View style={styles.itemUnitAmount}>
              <Text style={styles.h6}>Unit Price</Text>
            </View>
            <View style={styles.itemTotalAmount}>
              <Text style={[styles.h6, styles.alignRight]}>Total</Text>
            </View>
          </View>
          {items.map((item, index) => {
            const unitAmount = numeral(item.unit_amount).format(`${currency}0,0.00`);
            const totalAmount = numeral(item.total_amount).format(`${currency}0,0.00`);

            return (
              <View
                key={item.id}
                style={styles.itemRow}
              >
                <View style={styles.itemNumber}>
                  <Text style={styles.body2}>{index + 1}</Text>
                </View>
                <View style={styles.itemDescription}>
                  <Text style={styles.body2}>{item.description}</Text>
                </View>
                <View style={styles.itemQty}>
                  <Text style={styles.body2}>{item.quantity}</Text>
                </View>
                <View style={styles.itemUnitAmount}>
                  <Text style={[styles.body2, styles.alignRight]}>{unitAmount}</Text>
                </View>
                <View style={styles.itemTotalAmount}>
                  <Text style={[styles.body2, styles.alignRight]}>{totalAmount}</Text>
                </View>
              </View>
            );
          })}
          <View style={styles.summaryRow}>
            <View style={styles.summaryGap} />
            <View style={styles.summaryTitle}>
              <Text style={styles.body2}>Subtotal</Text>
            </View>
            <View style={styles.summaryValue}>
              <Text style={[styles.body2, styles.alignRight]}>{subtotalAmount}</Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryGap} />
            <View style={styles.summaryTitle}>
              <Text style={styles.body2}>Taxes</Text>
            </View>
            <View style={styles.summaryValue}>
              <Text style={[styles.body2, styles.alignRight]}>{taxAmount}</Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryGap} />
            <View style={styles.summaryTitle}>
              <Text style={styles.body2}>Total</Text>
            </View>
            <View style={styles.summaryValue}>
              <Text style={[styles.body2, styles.alignRight]}>{totalAmount}</Text>
            </View>
          </View>
        </View>
        <View style={styles.notes}>
          <Text style={[styles.h6, styles.gutterBottom]}>Notes</Text>
          <Text style={styles.body2}>
            Please make sure you have the right bank registration number as I had issues before and
            make sure you guys cover transfer expenses.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

