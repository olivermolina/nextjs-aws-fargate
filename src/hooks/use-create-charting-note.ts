import { trpc } from '../app/_trpc/client';
import { CreateChartInput, CreateChartItemInput } from '../utils/zod-schemas/chart';
import toast from 'react-hot-toast';
import { useUpdateSearchParams } from './use-update-search-params';
import { useDialog } from './use-dialog';
import { AllergyStatus, ChartItemType, ChartTemplate, ProblemStatus } from '@prisma/client';
import {
  ChartWithProfileChartItemType,
  ProfileChartItemType,
} from '../sections/dashboard/customer/customer-profile-chart-item';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';
import { undefined } from 'zod';
import { newObjectId } from '../utils/new-object-id';
import {
  mapHeightCountryUnit,
  mapTemperatureCountryUnit,
  mapWeightCountryUnit,
} from '../utils/vitals-utils';
import { useOrganizationStore } from './use-organization';
import { useParams } from 'next/navigation';

export const useCreateChartingNote = (chartId?: string, callback?: any) => {
  const { data: organization } = useOrganizationStore();
  const queryClient = useQueryClient();
  const dialog = useDialog<undefined | number | string>();
  const mutation = trpc.chart.create.useMutation();
  const queryKey = getQueryKey(
    trpc.chart.get,
    {
      id: chartId,
    },
    'query',
  );

  const country = organization?.address?.country;

  const mutationChartItem = trpc.chart.createChartItem.useMutation({
    // When mutate is called:
    onMutate: async (chartItem) => {
      // If the chartId is not provided, return
      if (!chartId) {
        return;
      }

      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKey });

      // Snapshot the previous value
      const previousChartData = queryClient.getQueryData(queryKey, {
        exact: true,
      }) as ChartWithProfileChartItemType;
      const itemId = newObjectId();
      const itemTypeId = newObjectId();
      const newItems = Array.isArray(previousChartData.items)
        ? previousChartData.items
        : ([] as ProfileChartItemType[]);

      // Insert newItem into array at index
      const insertIndex =
        typeof chartItem.order === 'number' ? chartItem.order + 1 : newItems.length;
      newItems.splice(insertIndex, 0, {
        id: itemId,
        type: chartItem.itemType as ChartItemType,
        order: previousChartData.items.length + 1,
        chart_id: chartId,
        vital_id: null,
        chart_note_id: null,
        chief_complaint_id: null,
        body_chart_id: null,
        chart_check_box_id: null,
        chart_range_id: null,
        chart_spine_id: null,
        chart_dropdown_id: null,
        chart_sketch_id: null,
        chart_heading_id: null,
        chart_note_editor_id: null,
        chart_file_id: null,
        history_id: null,
        allergy_id: null,
        problem_id: null,
        created_at: new Date(),
        updated_at: new Date(),
        ...(chartItem.itemType === ChartItemType.CHIEF_COMPLAINT.toString() && {
          chief_complaint_id: itemTypeId,
          ChiefComplaint: {
            id: itemTypeId,
            value: '',
          },
        }),
        ...(chartItem.itemType === ChartItemType.NOTE.toString() && {
          chart_note_id: itemTypeId,
          ChartNote: {
            id: itemTypeId,
            label: 'Note',
            value: '',
          },
        }),
        ...(chartItem.itemType === ChartItemType.NOTE_EDITOR.toString() && {
          chart_note_editor_id: itemTypeId,
          ChartNoteEditor: {
            id: itemTypeId,
            label: 'Note Editor',
            value: '',
          },
        }),
        ...(chartItem.itemType === ChartItemType.SKETCH.toString() && {
          chart_sketch_id: itemTypeId,
          ChartSketch: {
            id: itemTypeId,
            label: 'Sketch',
            canvas: '',
            background_s3_key: '',
          },
        }),
        ...(chartItem.itemType === ChartItemType.HEADING.toString() && {
          chart_heading_id: itemTypeId,
          ChartHeading: {
            id: itemTypeId,
            value: 'Heading',
          },
        }),
        ...(chartItem.itemType === ChartItemType.SPINE.toString() && {
          chart_spine_id: itemTypeId,
          ChartSpine: {
            id: itemTypeId,
            label: 'Spine',
            canvas: '',
            value: [],
            notes: '',
          },
        }),
        ...(chartItem.itemType === ChartItemType.BODY_CHART.toString() && {
          body_chart_id: itemTypeId,
          BodyChart: {
            id: itemTypeId,
            label: 'Body Chart',
            canvas: '',
            background_s3_key: '',
            points: [],
          },
        }),
        ...(chartItem.itemType === ChartItemType.FILE.toString() && {
          file_chart_id: itemTypeId,
          ChartFile: {
            id: itemTypeId,
            label: 'Upload',
            file_name: '',
            file_description: '',
            file_s3_key: '',
            file_type: '',
          },
        }),
        ...(chartItem.itemType === ChartItemType.DROPDOWN.toString() && {
          chart_dropdown_id: itemTypeId,
          ChartDropdown: {
            id: itemTypeId,
            label: 'Drop Down',
            options: ['1', '2', '3', '4', '5'],
            value: '',
            prompt: 'Select an option..',
          },
        }),
        ...(chartItem.itemType === ChartItemType.RANGE.toString() && {
          chart_range_id: itemTypeId,
          ChartRange: {
            id: itemTypeId,
            label: 'Range / Scale',
            options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            default_value: '5',
            value: '',
          },
        }),
        ...(chartItem.itemType === ChartItemType.CHECKBOXES.toString() && {
          chart_check_box_id: itemTypeId,
          ChartCheckBox: {
            id: itemTypeId,
            label: 'Check Boxes',
            options: ['1', '2', '3', '4', '5'],
            value: [],
            layout: 'horizontal',
            include_note: false,
            hide_unchecked_after_signing: false,
            required: false,
          },
        }),
        ...(chartItem.itemType === ChartItemType.VITALS.toString() && {
          vital_id: itemTypeId,
          Vital: {
            id: itemTypeId,
            user_id: chartItem.userId,
            date: new Date(),
            height_unit: mapHeightCountryUnit(country),
            weight_unit: mapWeightCountryUnit(country),
            temperature_unit: mapTemperatureCountryUnit(country),
            bmi: 0,
            height: 0,
            weight: 0,
            temperature: 0,
            systolic: 0,
            diastolic: 0,
            respiratory_rate: 0,
            heart_rate: 0,
            oxygen_saturation: 0,
            created_at: new Date(),
            updated_at: new Date(),
          },
        }),
        ...(chartItem.itemType === ChartItemType.ALLERGY.toString() && {
          allergy_id: itemTypeId,
          Allergy: {
            id: itemTypeId,
            user_id: chartItem.userId,
            name: '',
            reaction: '',
            onset_date: new Date(),
            status: AllergyStatus.ACTIVE,
            created_at: new Date(),
            updated_at: new Date(),
          },
        }),
        ...(chartItem.itemType === ChartItemType.PROBLEM.toString() && {
          problem_id: itemTypeId,
          Problem: {
            id: itemTypeId,
            user_id: chartItem.userId,
            title: '',
            synopsis: '',
            code: [],
            diagnostic_date: new Date(),
            status: ProblemStatus.ACTIVE,
            created_at: new Date(),
            updated_at: new Date(),
          },
        }),
      });

      const newChartData = {
        ...previousChartData,
        items: newItems.map((item, index) => ({ ...item, order: index + 1 })),
      };
      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, newChartData);
      // // Return a context object with the snapshotted value
      callback?.(insertIndex);
      return { previousChartData };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, input, context) => {
      // If the chartId is not provided, return
      if (!chartId) {
        return;
      }
      queryClient.setQueryData(queryKey, context?.previousChartData);
    },
    // Always refetch after error or success:
    onSettled: () => {
      // If the chartId is not provided, return
      if (!chartId) {
        return;
      }
      queryClient.invalidateQueries({ queryKey });
    },
  });
  const { replaceSearchParams } = useUpdateSearchParams();
  const params = useParams();
  const patientId = params.customerId as string;
  const mutationApplyChartTemplate = trpc.chart.applyChartTemplate.useMutation({
    onSettled: () => {
      // If the chartId is not provided, return
      if (!chartId) {
        return;
      }
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleSubmit = async (values: CreateChartInput) => {
    try {
      const result = await mutation.mutateAsync(values);
      if (result) {
        toast.success('Charting note created successfully');
        dialog.handleClose();
        replaceSearchParams({ chartId: result.id, tab: 'profile' });
      }
    } catch (e) {
      toast.error('Error creating charting note');
    }
  };

  const handleNewChartItem = async (input: CreateChartItemInput, callback?: any) => {
    dialog.handleClose();
    // TODO: Add more item types
    const allowedItemTypes = [
      ChartItemType.CHIEF_COMPLAINT.toString(),
      ChartItemType.NOTE.toString(),
      ChartItemType.NOTE_EDITOR.toString(),
      ChartItemType.SKETCH.toString(),
      ChartItemType.HEADING.toString(),
      ChartItemType.SPINE.toString(),
      ChartItemType.BODY_CHART.toString(),
      ChartItemType.FILE.toString(),
      ChartItemType.DROPDOWN.toString(),
      ChartItemType.RANGE.toString(),
      ChartItemType.CHECKBOXES.toString(),
      ChartItemType.VITALS.toString(),
      ChartItemType.ALLERGY.toString(),
      ChartItemType.PROBLEM.toString(),
    ];
    if (!allowedItemTypes.includes(input.itemType)) {
      toast.error('Coming soon...');
      return;
    }

    // check if the item type is vitals and throw if item type already exists
    if (input.itemType === ChartItemType.VITALS.toString()) {
      // Snapshot the previous value
      const previousChartData = queryClient.getQueryData(queryKey, {
        exact: true,
      }) as ChartWithProfileChartItemType;
      if (previousChartData.items.some((item) => item.type === ChartItemType.VITALS.toString())) {
        toast.error('Vitals already exists');
        return;
      }
    }

    try {
      const result = await mutationChartItem.mutateAsync(input);

      if (result) {
        toast.success('Success!');
        dialog.handleClose();
        if (!chartId) {
          replaceSearchParams({ chartId: result.chart_id, tab: 'profile' });
        }
        console.log('result.order', result.order);
        setTimeout(() => callback?.(result.order - 1), 1000);
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleApplyTemplate = async (chartTemplate: ChartTemplate) => {
    if (!patientId) {
      toast.error('Patient ID not found');
      return;
    }
    try {
      const result = await mutationApplyChartTemplate.mutate({
        userId: patientId,
        chartId: chartId,
        templateId: chartTemplate.id,
      });
      queryClient.setQueryData(queryKey, result);
      dialog.handleClose();
      toast.success('Template applied successfully');
    } catch (e) {
      toast.error('Error applying template');
    }
  };

  return {
    isLoading: mutation.isLoading,
    handleSubmit,
    chart: mutation.data,
    dialog,
    handleNewChartItem,
    handleApplyTemplate,
  };
};
