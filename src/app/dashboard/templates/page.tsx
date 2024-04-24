'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Seo } from 'src/components/seo';
import { usePageView } from 'src/hooks/use-page-view';
import { useSettings } from 'src/hooks/use-settings';
import { TemplateCard } from '../../../sections/dashboard/templates/template-card';
import { TemplateListSearch } from '../../../sections/dashboard/templates/template-list-search';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import AddIcon from '@mui/icons-material/Add';
import { useCallback, useMemo, useState } from 'react';
import { TemplateEditor } from '../../../sections/dashboard/templates/template-editor';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TemplateInput, TemplateValidationSchema } from '../../../utils/zod-schemas/template';
import { trpc } from '../../_trpc/client';
import toast from 'react-hot-toast';
import { Skeleton } from '@mui/material';
import { Option, professionOptions, sharedOptions } from '../../../constants/template-options';

interface EditorState {
  isFullScreen: boolean;
  isOpen: boolean;
}

const useTemplateEditor = (refetch: any) => {
  const mutation = trpc.template.save.useMutation();
  const deleteMutation = trpc.template.delete.useMutation();
  const methods = useForm<TemplateInput>({
    resolver: zodResolver(TemplateValidationSchema),
    mode: 'all',
  });

  const initialState: EditorState = {
    isFullScreen: false,
    isOpen: false,
  };

  const [state, setState] = useState<EditorState>(initialState);

  const handleOpen = useCallback((): void => {
    setState((prevState) => ({
      ...prevState,
      isOpen: true,
    }));
  }, []);

  const handleClose = useCallback(
    (): void => {
      setState(initialState);
      methods.reset({
        id: '',
        title: '',
        description: '',
        tags: [],
        content: '',
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleMaximize = useCallback((): void => {
    setState((prevState) => ({
      ...prevState,
      isFullScreen: true,
    }));
  }, []);

  const handleMinimize = useCallback((): void => {
    setState((prevState) => ({
      ...prevState,
      isFullScreen: false,
    }));
  }, []);

  const onSubmit = async (data: TemplateInput) => {
    try {
      const result = await mutation.mutateAsync(data);
      if (!data.id) {
        methods.reset({ ...result, id: result.id });
      }
      toast.success('Template saved successfully');
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleEditTemplate = (template: TemplateInput) => {
    methods.reset(template);
    handleOpen();
  };

  const handlePublishTemplate = async (template: TemplateInput) => {
    try {
      const result = await mutation.mutateAsync({
        ...template,
        shared: ['organization', 'community'],
      });
      methods.reset({ ...result, id: result.id });
      toast.success('Template published successfully');
      refetch();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleDeleteTemplate = async (template: TemplateInput) => {
    if (!template.id) return;

    try {
      await deleteMutation.mutateAsync({
        id: template.id,
      });
      await refetch();
      toast.success('Template deleted successfully');
    } catch (e) {
      toast.error(e);
    }
  };

  const handleNewTemplate = () => {
    handleClose();
    handleOpen();
  };

  return {
    ...state,
    handleClose,
    handleMaximize,
    handleMinimize,
    handleOpen,
    methods,
    onSubmit,
    handleEditTemplate,
    handleNewTemplate,
    handlePublishTemplate,
    handleDeleteTemplate,
    deleteIsLoading: deleteMutation.isLoading,
  };
};

export interface SearchChip {
  label: string;
  field: 'tags' | 'shared' | 'profession';
  value: unknown;
  displayValue?: unknown;
}

const useSearch = (tags: string[]) => {
  const [chips, setChips] = useState<SearchChip[]>([]);
  const [query, setQuery] = useState<string>('');
  const [tagValues, setTagValues] = useState<string[]>([]);
  const [sharedValues, setSharedValues] = useState<string[]>([]);
  const [professionValues, setProfessionValues] = useState<string[]>([]);

  const handleQueryChange = (query: string) => {
    setQuery(query);
  };

  const handleChipsChange = (
    newValues: string[],
    field: 'tags' | 'shared' | 'profession',
  ): void => {
    switch (field) {
      case 'tags':
        setTagValues(newValues);
        break;
      case 'shared':
        setSharedValues(newValues);
        break;
      case 'profession':
        setProfessionValues(newValues);
        break;
    }

    const nonFieldChips = chips.filter((chip) => chip.field !== field);
    const newFieldChips: SearchChip[] = newValues
      .filter((option) => !!option)
      .map((option) => {
        let searchOption: Option | undefined;
        switch (field) {
          case 'tags':
            const searchTag = tags.find((tag) => tag === option);
            searchOption = searchTag ? { label: searchTag, value: searchTag } : undefined;
            break;
          case 'shared':
            searchOption = sharedOptions.find((shared) => shared.value === option);
            break;
          case 'profession':
            searchOption = professionOptions.find((profession) => profession.value === option);
            break;
        }
        return {
          label: field,
          field,
          value: searchOption?.value,
          displayValue: searchOption?.label,
        };
      });
    setChips([...nonFieldChips, ...newFieldChips]);
  };

  const handleRemoveChip = (chip: SearchChip) => {
    setChips(chips.filter((c) => c.value !== chip.value));
  };

  const handleClearChips = () => {
    setChips([]);
    setTagValues([]);
    setSharedValues([]);
    setProfessionValues([]);
  };

  return {
    chips,
    handleChipsChange,
    handleRemoveChip,
    handleClearChips,
    handleQueryChange,
    query,
    tagValues,
    sharedValues,
    professionValues,
  };
};

const useTagStore = () => {
  const { data, refetch } = trpc.template.listTags.useQuery();

  const mutation = trpc.template.saveTag.useMutation();
  const deleteMutation = trpc.template.deleteTags.useMutation();

  const handleSaveTag = async (tag: string) => {
    try {
      await mutation.mutateAsync({
        name: tag,
      });
      await refetch();
      toast.success('Tag saved successfully');
    } catch (e) {
      toast.error(e);
    }
  };

  const handleDeleteTags = async (tags: string[]) => {
    try {
      await deleteMutation.mutateAsync({
        tags,
      });
      await refetch();
      toast.success('Tag deleted successfully');
    } catch (e) {
      toast.error(e);
    }
  };

  const tags = useMemo(
    () => (data ? ['Intake', ...data.map((tag) => tag.name)] : ['Intake']),
    [data],
  );

  return {
    tags,
    handleSaveTag,
    handleDeleteTags,
    addIsLoading: mutation.isLoading,
    deleteIsLoading: deleteMutation.isLoading,
  };
};

const Page = () => {
  const settings = useSettings();
  const tagStore = useTagStore();
  const search = useSearch(tagStore.tags);
  const { query, tagValues, sharedValues, professionValues } = search;

  const {
    data: templates,
    isLoading,
    refetch,
  } = trpc.template.list.useQuery({
    query,
    tags: tagValues.filter((value) => value !== undefined && value !== 'all'),
    shared: sharedValues.filter((value) => value !== undefined && value !== 'all'),
    profession: professionValues.filter((value) => value !== undefined && value !== 'all'),
  });
  const templateEditor = useTemplateEditor(refetch);

  usePageView();

  return (
    <>
      <Seo title="Dashboard: Templates" />
      <Box
        component="main"
        sx={{ flexGrow: 1 }}
      >
        <Box sx={{ py: '64px' }}>
          <Container maxWidth={settings.stretch ? false : 'xl'}>
            <Grid
              container
              spacing={{
                xs: 3,
                lg: 4,
              }}
            >
              <Grid xs={12}>
                <Stack
                  alignItems="flex-start"
                  direction="row"
                  justifyContent="space-between"
                  spacing={3}
                >
                  <Typography variant="h6">Templates</Typography>
                  <Button
                    variant={'contained'}
                    color={'primary'}
                    onClick={templateEditor.handleNewTemplate}
                    startIcon={
                      <SvgIcon>
                        <AddIcon />
                      </SvgIcon>
                    }
                  >
                    Create new template
                  </Button>
                </Stack>
              </Grid>
              <Grid xs={12}>
                <TemplateListSearch
                  {...search}
                  tags={tagStore.tags}
                />
              </Grid>
              {isLoading &&
                Array.from(Array(3)).map((_, index) => (
                  <Grid
                    key={index}
                    xs={12}
                    md={4}
                  >
                    <Skeleton
                      variant="rectangular"
                      sx={{ height: 180, borderRadius: 1 }}
                    />
                  </Grid>
                ))}

              {!isLoading && templates?.length === 0 && (
                <Grid xs={12}>
                  <Typography variant="body1">No templates found</Typography>
                </Grid>
              )}

              {templates?.map((template) => (
                <Grid
                  key={template.id}
                  xs={12}
                  md={4}
                >
                  <TemplateCard
                    template={template}
                    handleEditTemplate={templateEditor.handleEditTemplate}
                    handleDeleteTemplate={templateEditor.handleDeleteTemplate}
                    handlePublishTemplate={templateEditor.handlePublishTemplate}
                    deleteIsLoading={templateEditor.deleteIsLoading}
                    tags={tagStore.tags}
                  />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </Box>

      <FormProvider {...templateEditor.methods}>
        <TemplateEditor
          maximize={templateEditor.isFullScreen}
          onClose={templateEditor.handleClose}
          onMaximize={templateEditor.handleMaximize}
          onMinimize={templateEditor.handleMinimize}
          open={templateEditor.isOpen}
          onSubmit={templateEditor.onSubmit}
          tags={tagStore.tags}
          handleSaveTag={tagStore.handleSaveTag}
          addIsLoading={tagStore.addIsLoading}
          handleDeleteTags={tagStore.handleDeleteTags}
          deleteIsLoading={tagStore.deleteIsLoading}
        />
      </FormProvider>
    </>
  );
};

export default Page;
