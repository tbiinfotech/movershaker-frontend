import { useMemo, useState } from 'react';
import { MRT_EditActionButtons, MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Box, Button, DialogActions, DialogContent, DialogTitle, ListItemIcon, MenuItem } from '@mui/material';
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import DeleteIcon from '@mui/icons-material/Delete';
import { useSelector } from 'react-redux';
import LOGO from './../../assets/images/moverLogo.jpg';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const Example = () => {
  const [validationErrors, setValidationErrors] = useState({});
  const programs = useSelector((state) => state.module);
  let data = programs?.programs;

  const columns = useMemo(
    () => [
      {
        id: 'program',
        header: 'Program',
        columns: [
          {
            accessorFn: (row) => `${row.Product_Name}`,
            id: 'program_name',
            header: 'Program Name',
            size: 250,
            Cell: ({ renderedCellValue, row }) => (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <img alt="avatar" height={30} src={LOGO} loading="lazy" style={{ borderRadius: '50%' }} />
                {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
                <span>{renderedCellValue}</span>
              </Box>
            )
          }
        ]
      },
      {
        id: 'studio',
        header: 'Studio',
        columns: [
          {
            accessorKey: 'Studio',
            enableClickToCopy: true,
            filterVariant: 'autocomplete',
            header: 'Studio',
            size: 300
          }
        ]
      },
      {
        id: 'id',
        header: 'Total Minutes',
        columns: [
          {
            accessorKey: 'Total_Minutes',
            header: 'Total Minutes',
            size: 350
          }
        ]
      },
      {
        id: 'id',
        header: 'Start Date',
        columns: [
          {
            accessorFn: (row) => new Date(row.createdAt),
            id: 'createdAt',
            header: 'Start Date',
            filterVariant: 'date',
            filterFn: 'lessThan',
            sortingFn: 'datetime',
            Cell: ({ cell }) => cell.getValue()?.toLocaleDateString(),
            Header: ({ column }) => <em>{column.columnDef.header}</em>,
            muiFilterTextFieldProps: {
              sx: {
                minWidth: '250px'
              }
            }
          }
        ]
      }
    ],
    []
  );

  const { mutateAsync: createUser, isPending: isCreatingUser } = useCreateUser();
  const { data: fetchedUsers = data, isError: isLoadingUsersError, isFetching: isFetchingUsers, isLoading: isLoadingUsers } = useGetUsers();
  const { mutateAsync: updateUser, isPending: isUpdatingUser } = useUpdateUser();
  const { mutateAsync: deleteUser, isPending: isDeletingUser } = useDeleteUser();


  const handleCreateUser = async ({ values, table }) => {
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createUser(values);
    table.setCreatingRow(null);
  };

  const handleSaveUser = async ({ values, table }) => {
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateUser(values);
    table.setEditingRow(null);
  };

  const openDeleteConfirmModal = (row) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(row.original.id);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedUsers,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    // enableEditing: true,
    // enableRowActions: true,
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableGrouping: true,
    enableColumnPinning: true,
    enableFacetedValues: true,
    initialState: {
      columnPinning: {
        left: ['mrt-row-expand', 'mrt-row-select'],
        right: ['mrt-row-actions']
      }
    },
    muiSearchTextFieldProps: {
      size: 'small',
      variant: 'outlined'
    },

    getRowId: (row) => row.id,
    // muiToolbarAlertBannerProps: isLoadingUsersError
    //   ? {
    //       color: 'error',
    //       children: 'Error loading data'
    //     }
    //   : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: '500px'
      }
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUser,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveUser,
    // renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
    //   <>
    //     <DialogTitle variant="h3">Edit Student</DialogTitle>
    //     <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>{internalEditComponents}</DialogContent>
    //     <DialogActions>
    //       <MRT_EditActionButtons variant="text" table={table} row={row} />
    //     </DialogActions>
    //   </>
    // ),
    // renderRowActionMenuItems: ({ closeMenu, row }) => [
    //   <MenuItem key={0} onClick={() => openDeleteConfirmModal(row)} sx={{ m: 0 }}>
    //     <ListItemIcon>
    //       <DeleteIcon />
    //     </ListItemIcon>
    //     Delete
    //   </MenuItem>
    // ],
    // renderTopToolbarCustomActions: ({ table }) => (
    //   <Button
    //     variant="contained"
    //     onClick={() => {
    //       table.setCreatingRow(true);
    //     }}
    //   >
    //     Create New Student
    //   </Button>
    // ),
    state: {
      isLoading: isLoadingUsers,
      isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
      showAlertBanner: isLoadingUsersError,
      showProgressBars: isFetchingUsers
    }
  });

  return <MaterialReactTable table={table} />;
};

function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return Promise.resolve();
    },
    onMutate: (newUserInfo) => {
      queryClient.setQueryData(['users'], (prevUsers) => [
        ...prevUsers,
        { ...newUserInfo, id: (Math.random() + 1).toString(36).substring(7) }
      ]);
    }
  });
}

function useGetUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return Promise.resolve(fakeData);
    },
    refetchOnWindowFocus: false
  });
}

function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return Promise.resolve();
    },
    onMutate: (newUserInfo) => {
      queryClient.setQueryData(['users'], (prevUsers) =>
        prevUsers?.map((prevUser) => (prevUser.id === newUserInfo.id ? newUserInfo : prevUser))
      );
    }
  });
}

function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return Promise.resolve();
    },
    onMutate: (userId) => {
      queryClient.setQueryData(['users'], (prevUsers) => prevUsers?.filter((user) => user.id !== userId));
    }
  });
}

const queryClient = new QueryClient();

export default function App() {
  return (
    //
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Example />
      </LocalizationProvider>
    </QueryClientProvider>
    // </LocalizationProvider>
  );
}

const validateRequired = (value) => !!value.length;
const validateEmail = (email) =>
  !!email.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

function validateUser(user) {
  return {
    firstName: !validateRequired(user.firstName) ? 'First Name is Required' : '',
    lastName: !validateRequired(user.lastName) ? 'Last Name is Required' : '',
    email: !validateEmail(user.email) ? 'Incorrect Email Format' : ''
  };
}
