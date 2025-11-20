// import { makeStyles } from '@mui/material';

// export default makeStyles(() => ({
//   bold: {
//     fontWeight: 700
//   }
// }));

import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const BoldText = styled(Typography)(() => ({
  fontWeight: 700
}));
