// import { makeStyles } from '@material-ui/core'

// const useStyles = makeStyles((theme) => ({
//   scrollBox: {
//     display: "flex",
//     flexDirection: "column",
//     overflowY: "auto",
//     flex: 1,
//     maxHeight: "100%", // ensures proper growth
//     padding: theme.spacing(1),
//   },
//   tab: {
//     textTransform: "none",
//     fontWeight: 500,
//   },
// }));

// export default useStyles

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';

export const ScrollBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  flex: 1,
  maxHeight: '100%',
  padding: theme.spacing(1)
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  minWidth: '160px',
  color: 'black',
  // Selected tab styles
  '&.Mui-selected': {
    color: 'black' // selected text color
  }
}));
