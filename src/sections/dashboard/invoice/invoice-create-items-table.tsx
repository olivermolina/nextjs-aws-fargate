import type { ChangeEvent, FC } from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { randomId } from '@mui/x-data-grid-generator';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import AddIcon from '@mui/icons-material/Add';
import { Scrollbar } from 'src/components/scrollbar';

import { grey } from '@mui/material/colors';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRenderEditCellParams,
  GridRowId,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridRowsProp,
  GridSlotsComponentsProps,
  useGridApiContext,
} from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import LinearProgress from '@mui/material/LinearProgress';
import { ServiceWithStaff } from 'src/types/service';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Input from '@mui/material/Input';
import type { InvoiceItemInput } from 'src/utils/zod-schemas/invoice';

interface InvoiceCreateItemsTableProps {
  handleSaveInvoiceItem: (invoiceItem: any) => void;
  handleDeleteInvoiceItem: (invoiceItemId: string) => any;
  isLoading: boolean;
  invoiceItems: InvoiceItemInput[];
  services: ServiceWithStaff[];
}

export function CustomFooter(props: NonNullable<GridSlotsComponentsProps['footer']>) {
  return null;
}

function CustomEditComponent(
  props: GridRenderEditCellParams & { placeholder: string; type: string }
) {
  const { id, value, field, hasFocus } = props;
  const apiRef = useGridApiContext();
  const ref = useRef<HTMLInputElement>();

  useLayoutEffect(() => {
    if (hasFocus) {
      ref.current!.focus();
    }
  }, [hasFocus]);

  const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value; // The new value entered by the user
    apiRef.current.setEditCellValue({ id, field, value: newValue });
  };

  return (
    <Input
      inputRef={ref}
      disableUnderline={true}
      sx={{ px: 1 }}
      fullWidth
      value={value}
      onChange={handleValueChange}
      placeholder={props.placeholder}
      type={props.type}
      inputProps={{
        min: 0,
        step: 1,
      }}
    />
  );
}

type ServiceOptionType = Pick<ServiceWithStaff, 'id' | 'code' | 'price' | 'name'>;
const filter = createFilterOptions<ServiceOptionType>();

function ServiceEditCell(
  props: GridRenderEditCellParams & {
    services: ServiceOptionType[];
    rows: GridRowsProp;
  }
) {
  const [value, setValue] = useState<ServiceOptionType | null>(null);
  const { id, field, api, hasFocus, value: cellValue } = props;
  const ref = useRef<HTMLInputElement>();
  useLayoutEffect(() => {
    if (hasFocus) {
      ref.current!.focus();
    }
  }, [hasFocus]);

  const options = useMemo(() => {
    if (!cellValue || cellValue?.id) return props.services;

    const service = props.services.find((service) => service.id === cellValue?.id);
    if (service) {
      return props.services;
    }

    return [...props.services, cellValue as ServiceOptionType];
  }, [cellValue, props.services]);

  useEffect(() => {
    if (!value) return;
    api.setEditCellValue({ id, field, value: value });
    api.setEditCellValue({ id, field: 'code', value: value?.code });
    api.setEditCellValue({ id, field: 'cost', value: value?.price });
    api.setEditCellValue({ id, field: 'description', value: value?.name });
  }, [value]);

  return (
    <Autocomplete
      value={(cellValue as ServiceOptionType) || value}
      fullWidth
      getOptionLabel={(option: ServiceOptionType | string) =>
        typeof option === 'string' ? option : option.name
      }
      options={options}
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={ref}
          sx={{ px: 1 }}
          fullWidth
          placeholder={'Add service'}
          name="services"
          variant={'standard'}
          InputProps={{ ...params.InputProps, disableUnderline: true }}
          onChange={(event) => {
            api.setEditCellValue({
              id,
              field,
              value: {
                id: randomId(),
                name: event.target.value,
                code: cellValue?.code || '',
                price: cellValue?.price || 0,
              },
            });
          }}
        />
      )}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const { inputValue } = params;
        // Suggest the creation of a new value
        const isExisting = options.some((option) => inputValue === option.name);
        if (inputValue !== '' && !isExisting) {
          filtered.push({
            id: randomId(),
            name: inputValue,
            code: '',
            price: 0,
          });
        }

        return filtered;
      }}
      onChange={(event, newValue) => {
        if (typeof newValue === 'string') {
          setValue((prevState) => ({
            id: randomId(),
            name: newValue,
            code: prevState?.code || '',
            price: prevState?.price || 0,
          }));
        } else if (newValue && newValue.name) {
          // Create a new value from the user input
          setValue({
            id: randomId(),
            name: newValue.name,
            code: newValue.code || '',
            price: newValue.price || 0,
          });
        } else {
          setValue(newValue);
        }
      }}
      freeSolo
    />
  );
}

export const InvoiceCreateItemsTable: FC<InvoiceCreateItemsTableProps> = ({
  handleSaveInvoiceItem,
  handleDeleteInvoiceItem,
  isLoading,
  services,
}) => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const handleDeleteClick = useCallback(
    (id: GridRowId) => () => {
      const newRows = rows.filter((row) => row.id !== id);
      setRows(newRows);
      handleDeleteInvoiceItem(id as string);
    },
    [rows]
  );

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = {
      ...newRow,
      isNew: false,
    };

    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));

    if (newRow.id) {
      handleSaveInvoiceItem({
        ...updatedRow,
        id: newRow.id,
      });
    }

    return updatedRow;
  };

  const handleProcessRowUpdateError = (error: any) => {
    console.error('Error updating row', error);
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns: GridColDef[] = [
    {
      field: 'service',
      flex: 1,
      headerName: 'Service Name',
      editable: true,
      sortable: false,
      renderEditCell: (params: GridRenderEditCellParams) => (
        <ServiceEditCell
          {...params}
          services={services as ServiceOptionType[]}
          rows={rows}
        />
      ),
      renderCell: (params) => {
        const currentRow = params.row as (typeof rows)[0];
        return currentRow.service?.name || 'Add service';
      },
      headerClassName: 'table--header',
      disableReorder: true,
    },
    {
      field: 'code',
      flex: 1,
      headerName: 'Code',
      editable: true,
      sortable: false,
      type: 'string',
      headerAlign: 'left',
      align: 'left',
      headerClassName: 'table--header',
      renderEditCell: (params: GridRenderEditCellParams) => (
        <CustomEditComponent
          {...params}
          placeholder={'Add code'}
          type={'string'}
        />
      ),
      renderCell: (params) => {
        const currentRow = params.row as (typeof rows)[0];
        return currentRow.code || 'Add code';
      },
    },
    {
      field: 'cost',
      flex: 1,
      headerName: 'Cost',
      editable: true,
      sortable: false,
      type: 'number',
      headerAlign: 'left',
      align: 'left',
      headerClassName: 'table--header',
      renderEditCell: (params: GridRenderEditCellParams) => (
        <CustomEditComponent
          {...params}
          placeholder={'Add cost'}
          type={'number'}
        />
      ),
      renderCell: (params) => {
        const currentRow = params.row as (typeof rows)[0];
        return currentRow.cost || 'Add cost';
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      cellClassName: 'actions',
      headerClassName: 'table--header',
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            key={`delete-${id}`}
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
      sortable: false,
    },
  ];

  const handleNew = () => {
    const id = randomId();
    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        isNew: true,
        serviceId: undefined,
        service: undefined,
        code: '',
        cost: '',
        description: '',
      },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'service' },
    }));
  };

  return (
    <Box
      sx={{
        '& .table--header': {
          borderBottom: 2,
          borderColor: grey[200],
        },
      }}
    >
      <Scrollbar>
        <DataGrid
          sx={{
            border: 2,
            borderColor: 'primary.light',
            '.MuiDataGrid-columnSeparator': {
              display: 'none',
            },
            '.MuiDataGrid-cell': {
              borderColor: 'primary.light',
            },
          }}
          editMode="row"
          autoHeight
          slots={{
            loadingOverlay: LinearProgress,
            footer: CustomFooter,
          }}
          slotProps={{
            toolbar: {
              setRows,
              setRowModesModel,
              handleNew,
            },
          }}
          localeText={{ noRowsLabel: '' }}
          rows={rows}
          getRowId={(row) => row.id}
          loading={isLoading}
          columns={columns}
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          hideFooterPagination
          hideFooterSelectedRowCount
          disableColumnSelector
          disableColumnMenu
          disableColumnFilter
          disableDensitySelector
        />
      </Scrollbar>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          py: 2,
          px: 1,
        }}
      >
        <Button
          color="primary"
          startIcon={
            <SvgIcon>
              <AddIcon />
            </SvgIcon>
          }
          size="small"
          onClick={handleNew}
        >
          Add Service
        </Button>
      </Box>
    </Box>
  );
};
