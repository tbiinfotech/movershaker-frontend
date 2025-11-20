// import { makeStyles } from '@material-ui/core'

// export default makeStyles((theme) => ({
//   search: {
//     [theme.breakpoints.down('sm')]: {
//       display: 'none',
//     },
//   },
// }))

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

// Styled Search Wrapper
export const SearchWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    display: 'none'
  }
}));
