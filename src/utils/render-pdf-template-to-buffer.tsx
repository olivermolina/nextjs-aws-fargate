import { renderToBuffer } from '@joshuajaco/react-pdf-renderer-bundled';
import { TemplatePdfDocument } from '../sections/dashboard/templates/template-pdf-document';
import { Template } from '@prisma/client';

export const renderPdfTemplateToBuffer = (template: Template) => {
  return renderToBuffer(<TemplatePdfDocument template={template} />);
};

export default renderPdfTemplateToBuffer;
