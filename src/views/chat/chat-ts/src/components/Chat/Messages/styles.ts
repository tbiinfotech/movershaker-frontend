// import { makeStyles } from '@mui/material/styles';
import img from './../../../../public/chatbg.jpg';

// export default makeStyles((theme: any) => ({
//   scrollBox: {
//     overflowY: 'scroll',
//     backgroundColor: '#f0f0f0',
//     paddingBottom: '16px',
//     backgroundImage: `url(${img})`
//   },
//   message: {
//     maxWidth: '60%',
//     padding: '8px 12px',
//     position: 'relative',
//     wordWrap: 'break-word'
//   },
//   ownMessage: {
//     marginLeft: 'auto',
//     backgroundColor: '#d9fdd3',
//     color: '#111010'
//   },
//   otherMessage: {
//     marginRight: 'auto',
//     backgroundColor: '#ffffff',
//     color: '#111010'
//   },
//   senderName: {
//     fontSize: '0.8rem',
//     fontWeight: 'bold',
//     marginBottom: '4px',
//     color: theme.palette.text.secondary
//   },
//   messageText: {
//     fontSize: '1rem',
//     lineHeight: '1.4',
//     wordWrap: 'break-word', // Breaks long words
//     overflowWrap: 'break-word', // Ensures words break correctly
//     whiteSpace: 'pre-wrap', // Keeps whitespaces and wraps text
//     maxWidth: '100%' // Ensures the text stays within the container's width
//   },

//   deletedMessage: {
//     fontStyle: 'italic',
//     color: '#888'
//   },
//   mediaImage: {
//     maxWidth: '100%',
//     borderRadius: '8px',
//     marginTop: '8px'
//   },
//   mediaVideo: {
//     maxWidth: '100%',
//     borderRadius: '8px',
//     marginTop: '8px'
//   },
//   unsupportedFile: {
//     fontSize: '0.9rem',
//     color: '#888'
//   },
//   replyText: {
//     marginTop: '4px',
//     fontStyle: 'italic',
//     color: theme.palette.text.secondary
//   },
//   timestamp: {
//     fontSize: '0.75rem',
//     color: theme.palette.text.secondary
//   },
//   readStatus: {
//     fontSize: '0.75rem',
//     display: 'flex',
//     alignItems: 'center'
//   },
//   readTicks: {
//     color: 'blue'
//   },
//   unreadTick: {
//     color: theme.palette.text.secondary
//   },
//   menu: {
//     position: 'absolute',
//     backgroundColor: 'white',
//     border: '1px solid #ccc',
//     borderRadius: '4px',
//     zIndex: 1000,
//     padding: '8px 0',
//     minWidth: '150px',
//     bottom: '50%'
//   },
//   menuItem: {
//     padding: '8px 16px',
//     cursor: 'pointer',
//     transition: 'background-color 0.2s',
//     '&:hover': {
//       // Correctly define the hover state
//       backgroundColor: '#f0f0f0'
//     }
//   },

//   replyButton: {
//     marginTop: '8px', // Space above buttons
//     padding: '8px 12px', // Padding inside buttons
//     border: 'none', // Remove default border
//     borderRadius: '4px', // Rounded corners for buttons
//     backgroundColor: '#007bff', // Primary button color
//     color: 'white', // Text color for buttons
//     cursor: 'pointer', // Pointer cursor on hover
//     transition: 'background-color 0.2s', // Smooth transition for hover effect
//     '&:hover': {
//       backgroundColor: '#0056b3' // Darker shade on hover
//     }
//   },

//   replyContainer: {
//     borderLeft: '4px solid #34b7f1', // Add a colored border
//     backgroundColor: '#f0f0f0',
//     padding: '8px',
//     marginBottom: '8px',
//     borderRadius: '8px'
//   },

//   replyHeader: {
//     fontWeight: 'bold',
//     color: '#128c7e', // Highlight the sender's name
//     marginBottom: '4px'
//   },

//   replySender: {
//     fontWeight: 'bold',
//     fontSize: '12px'
//   },

//   replyMessage: {
//     backgroundColor: '#fff',
//     borderRadius: '8px',
//     padding: '8px',
//     boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // Adds a shadow for a card effect
//     display: 'flex',
//     alignItems: 'center'
//   },

//   replyMessageText: {
//     fontSize: '14px',
//     color: '#555',
//     whiteSpace: 'nowrap',
//     overflow: 'hidden',
//     textOverflow: 'ellipsis'
//   },

//   replyPanel: {
//     backgroundColor: '#f9f9f9',
//     borderRadius: '8px',
//     padding: '16px',
//     marginTop: '16px',
//     boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
//   },

//   replyInput: {
//     width: '100%',
//     padding: '10px',
//     border: '1px solid #ddd',
//     borderRadius: '4px',
//     fontSize: '14px',
//     outline: 'none',
//     marginTop: '8px'
//   },

//   sendButton: {
//     backgroundColor: '#128C7E',
//     color: '#fff',
//     padding: '8px 16px',
//     borderRadius: '4px',
//     fontSize: '14px',
//     border: 'none',
//     cursor: 'pointer',
//     marginRight: '8px',
//     transition: 'background-color 0.3s ease',
//     '&:hover': {
//       backgroundColor: '#0b6f5c'
//     }
//   },

//   cancelButton: {
//     backgroundColor: '#ddd',
//     color: '#333',
//     padding: '8px 16px',
//     borderRadius: '4px',
//     fontSize: '14px',
//     border: 'none',
//     cursor: 'pointer',
//     transition: 'background-color 0.3s ease',
//     '&:hover': {
//       backgroundColor: '#bbb'
//     }
//   }
// }));

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
// import img from './../../../../public/chatbg.jpg';

// Scroll container with background image
export const ScrollBox = styled(Box)(({ theme }) => ({
  overflowY: 'scroll',
  backgroundColor: '#f0f0f0',
  paddingBottom: 16,
  backgroundImage: `url(${img})`,
  backgroundSize: 'cover'
  // flexDirection: 'column-reverse'
}));

// Message bubble
export const MessageC = styled(Box)<{ $ownMessage?: boolean }>(({ theme, $ownMessage }) => ({
  maxWidth: '60%',
  padding: '8px 12px',
  position: 'relative',
  wordWrap: 'break-word',
  backgroundColor: $ownMessage ? '#d9fdd3' : '#ffffff',
  color: $ownMessage ? '#111010' : '#111010',
  marginRight: $ownMessage ? 'unset' : 'auto',
  marginLeft: $ownMessage ? 'auto' : 'unset',
  borderRadius: '10px',
  display: 'flex',
  flexDirection: 'column'
  // position:"relative"
}));

// Own message bubble
export const OwnMessage = styled(MessageC)(({ theme }) => ({
  marginLeft: 'auto',
  backgroundColor: '#d9fdd3',
  color: '#111010'
}));

// Other user's message bubble
export const OtherMessage = styled(MessageC)(({ theme }) => ({
  marginRight: 'auto',
  backgroundColor: '#ffffff',
  color: '#111010'
}));

// Sender name text
export const SenderName = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  fontWeight: 'bold',
  marginBottom: 4,
  color: theme.palette.text.secondary
}));

// Message text
export const MessageText = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  lineHeight: 1.4,
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
  whiteSpace: 'pre-wrap',
  maxWidth: '100%'
}));

// Deleted message text
export const DeletedMessage = styled(Typography)(({ theme }) => ({
  fontStyle: 'italic',
  color: '#888'
}));

// Attached image
export const MediaImage = styled('img')(({ theme }) => ({
  maxWidth: '100%',
  borderRadius: 8,
  marginTop: 8
}));

// Attached video
export const MediaVideo = styled('video')(({ theme }) => ({
  maxWidth: '100%',
  borderRadius: 8,
  marginTop: 8
}));

// Generic unsupported file label
export const UnsupportedFile = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  color: '#888'
}));

// Reply text under message
export const ReplyText = styled(Typography)(({ theme }) => ({
  marginTop: 4,
  fontStyle: 'italic',
  color: theme.palette.text.secondary
}));

// Timestamp underneath or top-corner
export const Timestamp = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary
}));

// Read status row
export const ReadStatus = styled(Box)(({ theme }) => ({
  fontSize: '0.75rem',
  display: 'flex',
  alignItems: 'center'
}));

// Blue double-ticks
export const ReadTicks = styled('span')(({ theme }) => ({
  color: 'blue'
}));

// Grey single tick
export const UnreadTick = styled('span')(({ theme }) => ({
  color: theme.palette.text.secondary
}));

// Message menu
export const MenuBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  backgroundColor: 'white',
  border: '1px solid #ccc',
  borderRadius: 4,
  zIndex: 1000,
  padding: '8px 0',
  minWidth: 150,
  bottom: '50%'
}));

// Message menu item
export const MenuItemC = styled(Box)(({ theme }) => ({
  padding: '8px 16px',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: '#f0f0f0'
  }
}));

// Reply button
export const ReplyButton = styled('button')(({ theme }) => ({
  marginTop: 8,
  padding: '8px 12px',
  border: 'none',
  borderRadius: 4,
  backgroundColor: '#007bff',
  color: 'white',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: '#0056b3'
  }
}));

// Reply container (quoted message)
export const ReplyContainer = styled(Box)(({ theme }) => ({
  borderLeft: '4px solid #34b7f1',
  backgroundColor: '#f0f0f0',
  padding: 8,
  marginBottom: 8,
  borderRadius: 8
}));

// Reply header (sender name)
export const ReplyHeader = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: '#128c7e',
  marginBottom: 4
}));

// Reply sender line
export const ReplySender = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: 12
}));

// Reply message bubble
export const ReplyMessage = styled(Box)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: 8,
  padding: 8,
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center'
}));

// Truncated text inside reply bubble
export const ReplyMessageText = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  color: '#555',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
}));

// Container for the reply input area
export const ReplyPanel = styled(Box)(({ theme }) => ({
  backgroundColor: '#f9f9f9',
  borderRadius: 8,
  padding: 16,
  marginTop: 16,
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
}));

// Reply Input field
export const ReplyInput = styled('input')(({ theme }) => ({
  width: '100%',
  padding: 10,
  border: '1px solid #ddd',
  borderRadius: 4,
  fontSize: 14,
  outline: 'none',
  marginTop: 8
}));

// Send button
export const SendButton = styled('button')(({ theme }) => ({
  backgroundColor: '#128C7E',
  color: '#fff',
  padding: '8px 16px',
  borderRadius: 4,
  fontSize: '14px',
  border: 'none',
  cursor: 'pointer',
  marginRight: 8,
  transition: 'background-color 0.3s ease',
  '&:hover': {
    backgroundColor: '#0b6f5c'
  }
}));

// Cancel button
export const CancelButton = styled('button')(({ theme }) => ({
  backgroundColor: '#ddd',
  color: '#333',
  padding: '8px 16px',
  borderRadius: 4,
  fontSize: '14px',
  border: 'none',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease',
  '&:hover': {
    backgroundColor: '#bbb'
  }
}));
