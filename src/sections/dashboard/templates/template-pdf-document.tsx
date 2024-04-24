import { Document, Page, StyleSheet } from '@joshuajaco/react-pdf-renderer-bundled';
import { Template } from '@prisma/client';
import Html from 'react-pdf-html';

interface TemplatePdfDocumentProps {
  template: Template;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    fontWeight: 400,
    fontSize: 8,
  },
});

export const TemplatePdfDocument = (props: TemplatePdfDocumentProps) => {
  const { template } = props;

  return (
    <Document>
      <Page
        size="A4"
      >
        <Html style={styles.page}>{template.content}</Html>
      </Page>
    </Document>
  );
};
