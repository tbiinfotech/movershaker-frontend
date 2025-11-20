import { styled } from '@mui/material/styles';
import Input from '@mui/material/Input';

export const StyledInput = styled(Input)(({ theme }) => ({
  borderRadius: '4px',
  height: '38px',
  paddingRight: theme.spacing(1.5),
  paddingLeft: theme.spacing(1.5)
}));
