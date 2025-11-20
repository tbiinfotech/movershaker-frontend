// import { makeStyles } from '@material-ui/core'

// export default makeStyles((theme) => ({
//   userInfo: {
//     [theme.breakpoints.down('sm')]: {
//       display: 'none',
//     },
//   },

//   userActions: {
//     [theme.breakpoints.down('sm')]: {
//       flexDirection: 'column',
//       margin: 'auto',
//     },
//   },

//   title: {
//     marginLeft: theme.spacing(2),
//     fontWeight: 700,
//   },
// }))

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// hides on small screens
export const UserInfo = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    display: 'none'
  }
}));

// stacks and centers on small screens
export const UserActions = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    margin: 'auto'
  }
}));

// title text
export const Title = styled(Typography)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  fontWeight: 700
}));
