import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { styled } from '@mui/material';

const formatProgramName = (productName) => {
  try {
    const regex = /(.*?)-(\d{4})(S\d)\s(.*)\s(.*)/;
    const matches = productName.match(regex);

    if (matches) {
      const [, , year, season, programName, day] = matches;
      const formattedDay = day.slice(0, 3);
      return `${programName} ${formattedDay} ${year} ${season}`;
    }

    return productName;
  } catch (error) {
    console.error('Error formatting program name:', error);
    return productName;
  }
};

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& label': {
    color: theme.palette.grey[700]
  },
  '& label.Mui-focused': {
    color: theme.palette.primary.main
  },

  '& .MuiFormControl-root': {
    width: '100%'
  },

  '& .MuiInputBase-root': {
    borderRadius: 8,
    width: '100%',
    minHeight: '60px',
    '&.Mui-focused': {
      borderColor: '#86b7fe',
      outline: '0',
      boxShadow: '0 0 0 0.25rem rgba(13, 110, 253, 0.25)'
    }
  },
  '& .MuiInputBase-input': {
    padding: '10px 14px'
  },
  '& .MuiOutlinedInput-root': {
    padding: 0,
    '& fieldset': {
      borderColor: theme.palette.grey[400]
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.light
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      border: 'none'
    }
  }
}));

export default function AutoCompleteSelect({ options, value, setFieldValue }) {
  return (
    <Autocomplete
      multiple
      disablePortal
      options={options.map((option) => ({ id: option._id, label: formatProgramName(option.Product_Name) }))}
      value={value ? value : []}
      sx={{
        width: '100%'
      }}
      onChange={(e, newValue) => {
        setFieldValue('program', newValue);
      }}
      renderInput={(params) => <StyledTextField {...params} placeholder="Enter program name" />}
    />
  );
}
