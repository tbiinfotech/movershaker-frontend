// import { makeStyles } from '@material-ui/core'

// export default makeStyles((theme) => ({
//   input: {
//     height: '38px',
//     paddingRight: theme.spacing(1.5),
//     paddingLeft: theme.spacing(1.5),
//     marginBottom: theme.spacing(2),
//     borderRadius: '4px',
//   },

//   list: {
//     width: '100%',
//     height: '160px',
//     padding: '0',
//     overflowY: 'scroll',
//     overflowX: 'hidden',
//     marginBottom: theme.spacing(2),
//   },

//   li: {
//     borderRadius: '4px',
//     padding: theme.spacing(1),
//   },

//   avatar: {
//     width: theme.spacing(3),
//     height: theme.spacing(3),
//     marginRight: theme.spacing(1),
//   },
// }))

import { styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';

// Styled Input
export const StyledInput = styled(InputBase)(({ theme }) => ({
  height: 38,
  paddingRight: theme.spacing(1.5),
  paddingLeft: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  borderRadius: 4,
  // border: `1px solid ${theme.palette.grey[300]}`,
  backgroundColor: theme.palette.background.paper
}));

// Styled List Container
export const StyledList = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 160,
  padding: 0,
  overflowY: 'scroll',
  overflowX: 'hidden',
  marginBottom: theme.spacing(2)
  // borderRadius: 4,
  // border: `1px solid ${theme.palette.divider}`
}));

// Styled List Item
export const StyledListItem = styled(Box)(({ theme }) => ({
  borderRadius: 4,
  padding: theme.spacing(1),
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  },
  display: 'flex'
}));

// Styled Avatar
export const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(3),
  height: theme.spacing(3),
  marginRight: theme.spacing(1)
}));
