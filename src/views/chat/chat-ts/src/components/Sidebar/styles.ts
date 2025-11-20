// import { makeStyles } from '@material-ui/core'

// export default makeStyles((theme) => ({
//   sidebar: {
//     width: '100%',
//     maxWidth: '32%',
//     // [theme.breakpoints.down('sm')]: {
//     //   width: '32%',
//     // },
//   },
// }))

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

export const SidebarWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '32%',

  // responsive example (same as commented code)
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100%'
  }
}));
