import { makeStyles } from '@material-ui/core'

export default makeStyles((theme) => ({
  button: {
    textTransform: 'none',
  },

  active: {
    backgroundColor: theme.palette.action.selected,
  },

  avatar: {
    width: '50px',
    height: '50px',
  },

  link: {
    textDecoration: 'none',
  },
  roundedButton: {
    borderRadius: '50%',
    background: '#25d366',
    width: '24px',
    height: '24px',
    display: 'flex', // Ensures proper centering
    justifyContent: 'center', // Horizontal alignment
    alignItems: 'center', // Vertical alignment
    fontSize: 'small',
    fontWeight: 700,
    color: '#fff',
    alignSelf: 'flex-end', // Matches align-self: end in CSS
  },
  recentMessageUnread: {
    fontWeight: 700,
    fontSize: 13,
    alignSelf: 'flex-start',
    color: '#3b4a54'
  },
  recentMessage: {
    fontSize: 13,
    alignSelf: 'flex-start',
  },
  chat_title: {
    marginLeft: 0,  }
}))
