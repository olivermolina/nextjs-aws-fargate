import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { Address, Chart, Organization, User } from '@prisma/client';
import { getBaseUrl } from '../../../utils/get-base-url';
import { getUserFullName } from '../../../utils/get-user-full-name';
import dayjs from 'dayjs';
import Html from 'react-pdf-html';

interface Props {
  chart: Chart & {
    signed_by: User | null;
    user: User & {
      address: Address | null;
    };
    created_by: User;
  };
  organization?: Organization & {
    address: Address | null;
  };
  logo?: string;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  h3: {
    fontSize: 16,
    lineHeight: 1.235,
  },
  h4: {
    fontSize: 14,
    lineHeight: 1.235,
    color: 'gray',
  },
  h6: {
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.6,
  },
  alignRight: {
    textAlign: 'right',
  },
  subtitle1: {
    fontSize: 10,
    fontWeight: 800,
    lineHeight: 1.6,
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
    marginBottom: 10,
  },
  uppercase: {
    textTransform: 'uppercase',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brand: {
    height: 32,
    width: 32,
  },
  patient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  items: {
    marginTop: 32,
  },
  divider: {
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: 'gray',
    borderStyle: 'solid',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    color: 'gray',
    gap: 10,
  },
  grayText: {
    color: 'gray',
  },
});

const AddressView = ({ address }: { address?: Address | null }) => {
  if (!address) return '';

  return (
    <>
      {address.address_line1 && address.address_line2 ? (
        <Text style={styles.body2}>{address.address_line1}</Text>
      ) : (
        <Text style={styles.body2}>
          {address.address_line1}, {address.postal_code}
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

export const ChartPdfDocument = (props: Props) => {
  const { chart, organization, logo } = props;

  return (
    <Document>
      <Page
        size="A4"
        style={styles.page}
        wrap={false}
      >
        <View style={styles.header}>
          <View>
            <Image
              src={{
                uri: logo || `${getBaseUrl()}/assets/logo.jpg`,
                method: 'GET',
                headers: { 'Cache-Control': 'no-cache' },
                body: '',
              }}
              style={styles.brand}
            />
          </View>
          <View>
            <Text style={styles.subtitle1}>{organization?.name || ''} by Luna Health</Text>
            <AddressView address={organization?.address} />
            <Text style={styles.body2}>
              Tel: {organization?.phone || ''} Email:{' '}
              {organization?.email || organization?.bill_email || ''}
            </Text>
          </View>
        </View>
        <View style={styles.patient}>
          <View>
            <Text style={styles.h4}>Chart</Text>
            <Text style={styles.body2}>{getUserFullName(chart.user)}</Text>
            <Text style={styles.body2}>
              Date of Birth: {dayjs(chart.user.birthdate).format('YYYY-MM-DD')}
            </Text>
            <AddressView address={chart.user.address} />
            <Text style={styles.body2}>Tel: {chart.user.phone || ''}</Text>
            <Text style={styles.body2}>Email: {chart.user.email}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.gutterBottom}>
          <View style={styles.chartHeader}>
            <Text style={styles.h6}>{dayjs(chart.created_at).format('MMMM DD, YYYY')}</Text>
            <Text style={styles.body2}>
              Added by: {getUserFullName(chart.created_by)} -{' '}
              {chart.signed_by ? 'Signed' : 'Unsigned Draft'}
            </Text>
          </View>
        </View>
        <View>
          {chart.free_text && (
            <View style={styles.gutterBottom}>
              <Html
                resetStyles
                style={styles.body2}
              >
                {chart.free_text}
              </Html>
            </View>
          )}
          {chart.subjective_text && (
            <View style={styles.gutterBottom}>
              <Text style={styles.h3}>Subjective</Text>
              <Html
                resetStyles
                style={styles.body2}
              >
                {chart.subjective_text}
              </Html>
            </View>
          )}
          {chart.objective_text && (
            <View style={styles.gutterBottom}>
              <Text style={styles.h3}>Objective</Text>
              <Html
                resetStyles
                style={styles.body2}
              >
                {chart.objective_text}
              </Html>
            </View>
          )}
          {chart.assessment_text && (
            <View style={styles.gutterBottom}>
              <Text style={styles.h3}>Assessment</Text>
              <Html
                resetStyles
                style={styles.body2}
              >
                {chart.assessment_text}
              </Html>
            </View>
          )}
          {chart.plan_text && (
            <View style={styles.gutterBottom}>
              <Text style={styles.h3}>Plan</Text>
              <Html
                resetStyles
                style={styles.body2}
              >
                {chart.plan_text}
              </Html>
            </View>
          )}
        </View>
        <View style={styles.items}>
          <Text style={styles.h6}>Signature</Text>
          {chart.signed_by ? (
            <>
              <Text style={styles.body2}>{getUserFullName(chart.signed_by)}</Text>
              <Text style={styles.body2}>{dayjs(chart.signed_at).format('MMMM DD, YYYY')}</Text>
            </>
          ) : (
            <Text style={[styles.body2, styles.grayText]}>Signature not provided</Text>
          )}
        </View>
      </Page>
    </Document>
  );
};
