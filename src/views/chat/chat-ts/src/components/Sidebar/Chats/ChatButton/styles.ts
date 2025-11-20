// import { makeStyles } from '@material-ui/core'

// export default makeStyles((theme) => ({
//   button: {
//     textTransform: 'none',
//   },

//   active: {
//     backgroundColor: theme.palette.action.selected,
//   },

//   avatar: {
//     width: '50px',
//     height: '50px',
//   },

//   link: {
//     textDecoration: 'none',
//   },
//   roundedButton: {
//     borderRadius: '50%',
//     background: '#25d366',
//     width: '24px',
//     height: '24px',
//     display: 'flex', // Ensures proper centering
//     justifyContent: 'center', // Horizontal alignment
//     alignItems: 'center', // Vertical alignment
//     fontSize: 'small',
//     fontWeight: 700,
//     color: '#fff',
//     alignSelf: 'flex-end', // Matches align-self: end in CSS
//   },
//   recentMessageUnread: {
//     fontWeight: 700,
//     fontSize: 13,
//     alignSelf: 'flex-start',
//     color: '#3b4a54'
//   },
//   recentMessage: {
//     fontSize: 13,
//     alignSelf: 'flex-start',
//   },
//   chat_title: {
//     marginLeft: 0,  }
// }))

import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// Button (no text uppercase)
export const StyledButton = styled(Button)<{ $active?: boolean }>(({ theme, $active }) => ({
  textTransform: 'none',
  backgroundColor: $active ? theme.palette.action.selected : 'transparent'
}));

// Active chat background highlight
export const ActiveItem = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.action.selected
}));

// Avatar size
export const ChatAvatar = styled(Avatar)(({ theme }) => ({
  width: 50,
  height: 50
}));

// Link style (remove underline)
export const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none'
}));

// Green Rounded Button (WhatsApp-style bubble count)
export const RoundedButton = styled(Box)(({ theme }) => ({
  borderRadius: '50%',
  background: '#25d366',
  width: 24,
  height: 24,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: 'small',
  fontWeight: 700,
  color: '#fff',
  alignSelf: 'flex-end'
}));

// Recent unread message text
export const RecentMessageUnread = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: 13,
  alignSelf: 'flex-start',
  color: '#3b4a54'
  // color: 'rgba(0, 0, 0, 0.54)'
}));

// Recent message (read) text
export const RecentMessage = styled(Typography)(({ theme }) => ({
  fontSize: 13,
  alignSelf: 'flex-start',
  color: 'rgba(0, 0, 0, 0.54)'
}));

// Chat title
export const ChatTitle = styled(Typography)(({ theme }) => ({
  marginLeft: 0
}));
