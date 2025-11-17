import React, { useState, useEffect } from 'react';
import { DialogTitle, DialogContent, DialogActions, TextField, Button, Chip, Autocomplete } from '@mui/material';
import { useSelector } from 'react-redux';

const EditRowDialogContent = ({ table, row, internalEditComponents, handleSaveUser }) => {
  const [programOptions, setPrograms] = useState();
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const programs = useSelector((state) => state.module.programs);

  useEffect(() => {
    if (programs?.length > 0) {
      let programOption = programs.map((program) => ({
        value: program._id,
        label: program.Product_Name
      }));
      setPrograms(programOption);
    }
  }, [programs]);

  useEffect(() => {
    // Populate already assigned programs on component mount
    const currentPrograms = row.original.programs || [];
    const alreadyAddedProgram = currentPrograms.map((program) => ({
      value: program._id,
      label: program.name || 'Unnamed Program' // Fallback for missing labels
    }));
    setSelectedPrograms(alreadyAddedProgram);
  }, [row.original.programs]);

  return (
    <>
      <DialogTitle variant="h3">Edit Student</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {internalEditComponents}
        <Autocomplete
          multiple
          options={programOptions.map((program) => ({
            value: program._id,
            label: program.name || 'Unnamed Program' // Ensure options have labels
          }))}
          getOptionLabel={(option) => option.label || 'Unnamed Program'} // Fallback label
          value={selectedPrograms} // Controlled value
          isOptionEqualToValue={(option, value) => option.value === value.value} // Prevent duplication
          onChange={(event, newValue) => setSelectedPrograms(newValue)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => <Chip key={option.value} label={option.label} {...getTagProps({ index })} />)
          }
          renderInput={(params) => <TextField {...params} label="Assign Programs" placeholder="Select programs" />}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            const updatedValues = {
              ...row.original,
              programs: selectedPrograms.map((program) => ({ _id: program.value }))
            };
            handleSaveUser({ values: updatedValues, table });
          }}
          variant="contained"
        >
          Save
        </Button>
        <Button onClick={() => table.setEditingRow(null)} variant="text">
          Cancel
        </Button>
      </DialogActions>
    </>
  );
};

export default EditRowDialogContent;
