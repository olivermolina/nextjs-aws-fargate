import { t } from 'src/server/trpc';
import list from './list';

import deleteChart from './delete-chart';
import updateChart from './update-chart';
import createChart from './create-chart';
import getChart from './get-chart';
import signChart from './sign-chart';
import createChartItem from './create-chart-item';
import saveChiefComplaint from './save-chief-complaint';
import deleteChiefComplaint from './delete-chief-complaint';
import saveNote from './save-note';
import deleteNote from './delete-note';
import saveNoteEditor from './save-note-editor';
import deleteNoteEditor from './delete-note-editor';
import saveSketch from './save-sketch';
import deleteSketch from './delete-sketch';
import saveHeading from './save-heading';
import deleteHeading from './delete-heading';
import saveChartItemOrder from './save-chart-element-order';
import saveSpine from './save-spine';
import deleteSpine from './delete-spine';
import deleteBodyChart from './delete-body-chart';
import saveBodyChart from './save-body-chart';
import saveFile from './save-file';
import deleteFile from './delete-file';
import saveDropdown from './save-dropdown';
import deleteDropdown from './delete-dropdown';
import deleteRange from './delete-range';
import saveRange from './save-range';
import deleteCheckBox from './delete-checkbox';
import saveCheckbox from './save-checkbox';
import saveChartTemplate from './save-chart-template';
import templateList from './template-list';
import shareChartTemplate from './share-chart-template';
import applyChartTemplate from './apply-chart-template';

/**
 * Chart router
 */
const chartRouter = t.router({
  create: createChart,
  update: updateChart,
  delete: deleteChart,
  get: getChart,
  list,
  sign: signChart,
  createChartItem,
  saveChiefComplaint,
  deleteChiefComplaint,
  saveNote,
  deleteNote,
  saveNoteEditor,
  deleteNoteEditor,
  saveSketch,
  deleteSketch,
  saveHeading,
  deleteHeading,
  saveChartItemOrder,
  saveSpine,
  deleteSpine,
  saveBodyChart,
  deleteBodyChart,
  saveFile,
  deleteFile,
  saveDropdown,
  deleteDropdown,
  saveRange,
  deleteRange,
  deleteCheckBox,
  saveCheckbox,
  saveChartTemplate,
  templateList,
  shareChartTemplate,
  applyChartTemplate,
});

export default chartRouter;
