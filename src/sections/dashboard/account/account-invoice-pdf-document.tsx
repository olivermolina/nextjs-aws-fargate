import type { FC } from 'react';
import { format } from 'date-fns';
import numeral from 'numeral';
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import Stripe from 'stripe';
import { getBaseUrl } from '../../../utils/get-base-url';

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

interface InvoicePdfDocumentProps {
  invoice: Stripe.Invoice;
}

const BillingAddressView = ({
                              address,
                            }: {
  address?: Stripe.Invoice['customer_address'] | null;
}) => {

  if (!address) return null;

  return (
    <>
      {address.line1 && address.line2 ? (
        <Text style={styles.body2}>{address.line1}</Text>
      ) : (
        <Text style={styles.body2}>
          {address.line1}, ${address.postal_code}
        </Text>
      )}
      {address.line2 && (
        <Text style={styles.body2}>
          {address.line2}, {address.postal_code}
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

export const AccountInvoicePdfDocument: FC<InvoicePdfDocumentProps> = (props) => {
  const { invoice } = props;

  const currency = invoice.currency || '$';
  const items = invoice.lines?.data || [];
  const dueDate = invoice.due_date && format(invoice.due_date, 'dd MMM yyyy');
  const issueDate = invoice.created && format(invoice.created * 1000, 'dd MMM yyyy');
  const subtotalAmount = numeral(Number(invoice.subtotal) / 100).format(`${currency}0,0.00`);
  const taxAmount = numeral(Number(invoice.tax) / 100).format(`${currency}0,0.00`);
  const totalAmount = numeral(Number(invoice.total) / 100).format(`${currency}0,0.00`);
  const fullName = invoice.customer_name;

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
            <Text style={styles.h6}>Luna Health</Text>
          </View>
          <View>
            <Text style={[styles.h4, styles.uppercase, styles.colorSuccess]}>{invoice.status}</Text>
            <Text style={styles.subtitle2}>{invoice.number}</Text>
          </View>
        </View>
        <View style={styles.company}>
          <View>
            <BillingAddressView
              address={{
                line1: '4059 Carling Avenue',
                line2: 'Suite 202',
                city: 'Ottawa',
                state: 'Ontario',
                country: 'Canada',
                postal_code: 'K2K 2A4',
              }}
            />
          </View>
          <View>
            <Text style={styles.body2}>support@lunahealth.app</Text>
            <Text style={styles.body2}>+1 1578934525</Text>
          </View>
        </View>
        <View style={styles.references}>
          <View>
            <Text style={[styles.subtitle2, styles.gutterBottom]}>Due Date</Text>
            <Text style={styles.body2}>{dueDate || issueDate}</Text>
          </View>
          <View>
            <Text style={[styles.subtitle2, styles.gutterBottom]}>Date of issue</Text>
            <Text style={styles.body2}>{issueDate}</Text>
          </View>
          <View>
            <Text style={[styles.subtitle2, styles.gutterBottom]}>Number</Text>
            <Text style={styles.body2}>{invoice.number}</Text>
          </View>
        </View>
        <View style={styles.billing}>
          <Text style={[styles.subtitle2, styles.gutterBottom]}>Billed to</Text>
          <Text style={styles.body2}>{fullName}</Text>

          <Text style={styles.body2}>{invoice.customer_phone}</Text>
          <BillingAddressView address={invoice.customer_address} />
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
            const unitAmount = numeral(Number(item.unit_amount_excluding_tax) / 100).format(`${currency}0,0.00`);
            const totalAmount = numeral(Number(item.amount_excluding_tax) / 100).format(`${currency}0,0.00`);

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
