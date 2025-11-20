// import { makeStyles } from '@mui/material';

// export default makeStyles((theme: any) => ({
//   form: {
//     display: 'flex',
//     width: '100%'
//   },

//   input: {
//     marginLeft: theme.spacing(1),
//     marginRight: theme.spacing(1)
//   }
// }));

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';

export const FormWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%'
}));

export const StyledInput = styled(InputBase)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1)
}));
