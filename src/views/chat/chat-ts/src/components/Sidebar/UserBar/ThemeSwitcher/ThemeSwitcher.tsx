import { toggleDarkTheme } from '../../../../actions';
import { AppState } from '../../../../../../../../store/chatStore';
import Brightness2Icon from '@mui/icons-material/Brightness2';
import { IconButton } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';

const ThemeSwitcher = () => {
  const dispatch = useDispatch();

  return (
    <IconButton onClick={() => dispatch(toggleDarkTheme())}>
      <Brightness2Icon />
    </IconButton>
  );
};

export default ThemeSwitcher;
