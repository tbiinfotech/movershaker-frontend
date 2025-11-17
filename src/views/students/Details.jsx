import { useEffect, useMemo, useState } from 'react';
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  useMaterialReactTable
  // createRow,
} from 'material-react-table';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  MenuItem,
  DialogTitle,
  ListItemIcon,
  Autocomplete,
  Chip,
  TextField
} from '@mui/material';
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import LOGO from './../../assets/images/moverLogo.jpg';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_SERVER_URL;

const Example = () => {
  const [validationErrors, setValidationErrors] = useState({});
  const [programOptions, setPrograms] = useState();
  const students = useSelector((state) => state.module);
  const programs = useSelector((state) => state.module.programs);

  const [selectedPrograms, setSelectedPrograms] = useState([]);
  let data = students?.students;

  useEffect(() => {
    if (programs?.length > 0) {
      let programOption = programs.map((program) => ({
        value: program._id,
        label: program.Product_Name
      }));
      setPrograms(programOption);
    }
  }, [programs]);

  const columns = useMemo(
    () => [
      {
        id: 'student_name',
        // header: 'Student Name',
        columns: [
          {
            accessorFn: (row) => `${row.First_Name} ${row?.Last_Name ? row.Last_Name : ''}`,
            id: 'student_name',
            header: 'Student Name',
            muiEditTextFieldProps: {
              required: true,
              error: !!validationErrors?.student_name,
              helperText: validationErrors?.student_name,
              //remove any previous validation errors when user focuses on the input
              onFocus: () =>
                setValidationErrors({
                  ...validationErrors,
                  student_name: undefined
                })
              //optionally add validation checking for onBlur or onChange
            },
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
        id: 'email',
        columns: [
          {
            accessorKey: 'Email',
            enableClickToCopy: true,
            filterVariant: 'autocomplete',
            header: 'Email',
            size: 300
          }
        ]
      },
      {
        id: 'programs',
        columns: [
          {
            accessorFn: (row) => row.programs,
            id: 'programs',
            header: 'Programs',
            enableEditing: false,
            size: 300,
            Cell: ({ cell }) => {
              const programs = cell.getValue();
              if (programs.length > 0) {
                return (
                  <Box sx={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {programs.map((prog) => (
                      <Chip key={prog.id} label={prog.Product_Name} />
                    ))}
                  </Box>
                );
              }
              return <span>No Programs Assigned</span>;
            }
          }
        ]
      },
      {
        id: 'home_address',
        columns: [
          {
            accessorKey: 'Home_Address',
            enableClickToCopy: true,
            filterVariant: 'autocomplete',
            header: 'Home Address',
            size: 300
          }
        ]
      },
      {
        id: 'academy_location',
        // header: 'Academy location',
        columns: [
          {
            accessorKey: 'Academy_location',
            header: 'Academy location',
            size: 350
          }
        ]
      },
      {
        id: 'approval_state',
        // header: 'Status',
        columns: [
          {
            accessorKey: 'approval_state',
            header: 'Status',
            size: 350
          }
        ]
      },
      {
        id: 'id',
        // header: 'Start Date',
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
      },
      {
        id: 'zoho_id',

        // header: 'Start Date',
        columns: [
          {
            accessorKey: 'zoho_id',
            muiEditTextFieldProps: {
              disabled: true
            },
            header: 'Zoho id',
            size: 350
          }
        ]
      }
    ],
    []
  );

  const { mutateAsync: createUser, isPending: isCreatingUser } = useCreateUser();
  const {
    data: fetchedUsers = data,
    isError: isLoadingUsersError,
    isFetching: isFetchingUsers,
    isLoading: isLoadingUsers,
    refetch
  } = useGetUsers();
  const { mutateAsync: updateUser, isPending: isUpdatingUser } = useUpdateUser(selectedPrograms);
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
    // const newValidationErrors = validateUser(values);
    // if (Object.values(newValidationErrors).some((error) => error)) {
    //   setValidationErrors(newValidationErrors);
    //   return;
    // }
    setValidationErrors({});
    await updateUser(values);
    await refetch();
    table.setEditingRow(null);
  };

  const openDeleteConfirmModal = async (row) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(row.original);
      await refetch ();
    }
  };

  const renderEditRowDialogContent = ({ table, row, internalEditComponents }) => {
    const currentPrograms = row.original.programs || [];
    useEffect(() => {
      console.log('currentPrograms', currentPrograms);
      if (currentPrograms.length > 0) {
        const alreadyAddedProgram = currentPrograms.map((program) => ({
          label: program.Product_Name,
          value: program.id
        }));
        console.log('Added program', alreadyAddedProgram);
        setSelectedPrograms(alreadyAddedProgram); // Update selected programs state
      }
    }, [currentPrograms]);

    return (
      <>
        <DialogTitle variant="h3">Edit Student</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Autocomplete
            multiple
            options={programOptions}
            getOptionLabel={(option) => option.label}
            value={selectedPrograms}
            onChange={(event, newValue) => {
              console.log('selectedPrograms', selectedPrograms, newValue);
              setSelectedPrograms(newValue);
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => <Chip key={option.value} label={option.label} {...getTagProps({ index })} />)
            }
            renderInput={(params) => <TextField {...params} label="Assign Programs" placeholder="Select programs" />}
          />
          {internalEditComponents}
        </DialogContent>
        <DialogActions>
          <DialogActions>
            <MRT_EditActionButtons variant="text" table={table} row={row} />
          </DialogActions>
        </DialogActions>
      </>
    );
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedUsers,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    enableEditing: true,
    enableRowActions: true,
    paginationDisplayMode: 'pages',
    positionToolbarAlertBanner: 'bottom',
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableGrouping: true,
    enableColumnPinning: true,
    enableFacetedValues: true,
    initialState: {
      columnVisibility: { zoho_id: false },
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
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Create New User</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{internalEditComponents}</DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderEditRowDialogContent,
    // renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
    //   <>
    //     <DialogTitle variant="h3">Edit Student</DialogTitle>
    //     <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>{internalEditComponents}</DialogContent>
    //     <DialogActions>
    //       <MRT_EditActionButtons variant="text" table={table} row={row} />
    //     </DialogActions>
    //   </>
    // ),
    renderRowActionMenuItems: ({ row }) => [
      <MenuItem key={0} onClick={() => openDeleteConfirmModal(row)} sx={{ m: 0 }}>
        <ListItemIcon>
          <DeleteIcon />
        </ListItemIcon>
        Delete
      </MenuItem>
    ],
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
      const response = await axios.get(`${apiUrl}/api/student`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.data; // assuming your API returns data under data.data
    },
    refetchOnWindowFocus: false
  });
}

function useUpdateUser(selectedPrograms) {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: async (user) => {
      try {
        console.log('Updating user:', user);

        const response = await axios.post(
          `${apiUrl}/api/student/update-student-zoho`,
          {
            student_name: user.student_name,
            zoho_id: user.zoho_id,
            Email: user.Email,
            Home_Address: user.Home_Address,
            Academy_location: user.Academy_location,
            approval_state: user.approval_state,
            programs: selectedPrograms
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        return response.data; // Return updated user data or any relevant response
      } catch (error) {
        console.error('Error updating user:', error);
        throw new Error('Failed to update user.');
      }
    },
    onMutate: (newUserInfo) => {
      // Optimistically update the cache before the mutation is completed
      queryClient.setQueryData(['users'], (prevUsers) =>
        prevUsers?.map((prevUser) => (prevUser.id === newUserInfo.id ? { ...prevUser, ...newUserInfo } : prevUser))
      );
    },
    onError: (error) => {
      // Handle errors if any occur
      console.error('Mutation error:', error);
    },
    onSuccess: (data) => {
      // You can trigger a refetch or handle success if needed
      console.log('User updated successfully:', data);
      // Optionally refetch or invalidate queries if necessary
      queryClient.invalidateQueries(['users']);
      
    }
  });
}

function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user) => {
      try {
        console.log('Updating user:', user);

        const response = await axios.post(
          `${apiUrl}/api/student/delete-student-zoho`,
          {
            zoho_id: user.zoho_id
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        return response.data; // Return updated user data or any relevant response
      } catch (error) {
        console.error('Error updating user:', error);
        throw new Error('Failed to update user.');
      }
    },
    onError: (error) => {
      // Handle errors if any occur
      console.error('Mutation error:', error);
    },
    onSuccess: async (data) => {
      // You can trigger a refetch or handle success if needed
      console.log('User delete successfully:', data);
      // Optionally refetch or invalidate queries if necessary
      queryClient.invalidateQueries(['users']);
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

const validateRequired = (value) => !!value?.length;
const validateEmail = (email) =>
  !!email?.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

function validateUser(user) {
  console.log('user :::', user);
  return {
    student_name: !validateRequired(user.Student_Name) ? 'First Name is Required' : '',
    Email: !validateEmail(user.Email) ? 'Incorrect Email Format' : ''
  };
}
