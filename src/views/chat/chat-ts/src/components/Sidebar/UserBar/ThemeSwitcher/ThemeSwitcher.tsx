import { toggleDarkTheme } from '../../../../actions'
import { AppState } from '../../../../../../../../store/chatStore'
import Brightness2Icon from '@material-ui/icons/Brightness2'
import WbSunnyIcon from '@material-ui/icons/WbSunny'
import { IconButton } from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux'

const ThemeSwitcher = () => {
  const dispatch = useDispatch()

    return (
      <IconButton onClick={() => dispatch(toggleDarkTheme())}>
        <Brightness2Icon />
      </IconButton>
    )
  
}

export default ThemeSwitcher
