
import { makeStyles } from '@material-ui/core/styles';
import img from './../../../../public/chatbg.jpg'

export default makeStyles((theme) => ({
  scrollBox: {
    overflowY: 'scroll',
    backgroundColor: '#f0f0f0',
    paddingBottom: '16px',
    backgroundImage: `url(${img})`,
  },
  message: {
    maxWidth: '60%',
    padding: '8px 12px',
    position: 'relative',
    wordWrap: 'break-word',
  },
  ownMessage: {
    marginLeft: 'auto',
    backgroundColor: '#d9fdd3',
    color: '#111010',
  },
  otherMessage: {
    marginRight: 'auto',
    backgroundColor: '#ffffff',
    color: '#111010',
  },
  senderName: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
    marginBottom: '4px',
    color: theme.palette.text.secondary,
  },
  messageText: {
    fontSize: '1rem',
    lineHeight: '1.4',
    wordWrap: 'break-word',        // Breaks long words
    overflowWrap: 'break-word',    // Ensures words break correctly
    whiteSpace: 'pre-wrap',        // Keeps whitespaces and wraps text
    maxWidth: '100%',              // Ensures the text stays within the container's width
  },
  
  deletedMessage: {
    fontStyle: 'italic',
    color: '#888',
  },
  mediaImage: {
    maxWidth: '100%',
    borderRadius: '8px',
    marginTop: '8px',
  },
  mediaVideo: {
    maxWidth: '100%',
    borderRadius: '8px',
    marginTop: '8px',
  },
  unsupportedFile: {
    fontSize: '0.9rem',
    color: '#888',
  },
  replyText: {
    marginTop: '4px',
    fontStyle: 'italic',
    color: theme.palette.text.secondary,
  },
  timestamp: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },
  readStatus: {
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
  },
  readTicks: {
    color: 'blue',
  },
  unreadTick: {
    color: theme.palette.text.secondary,
  },
  menu: {
    position: 'absolute',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    zIndex: 1000,
    padding: '8px 0',
    minWidth: '150px',
    bottom: '50%',
  },
  menuItem: {
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': { // Correctly define the hover state
      backgroundColor: '#f0f0f0',
    },
  },


  replyButton: {
    marginTop: '8px', // Space above buttons
    padding: '8px 12px', // Padding inside buttons
    border: 'none', // Remove default border
    borderRadius: '4px', // Rounded corners for buttons
    backgroundColor: '#007bff', // Primary button color
    color: 'white', // Text color for buttons
    cursor: 'pointer', // Pointer cursor on hover
    transition: 'background-color 0.2s', // Smooth transition for hover effect
    '&:hover': {
      backgroundColor: '#0056b3', // Darker shade on hover
    },
  },

  replyContainer: {
    borderLeft: '4px solid #34b7f1', // Add a colored border
    backgroundColor: '#f0f0f0',
    padding: '8px',
    marginBottom: '8px',
    borderRadius: '8px',
  },
  
  replyHeader: {
    fontWeight: 'bold',
    color: '#128c7e', // Highlight the sender's name
    marginBottom: '4px',
  },
  
  replySender: {
    fontWeight: 'bold',
    fontSize: '12px',
  },
  
  replyMessage: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '8px',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // Adds a shadow for a card effect
    display: 'flex',
    alignItems: 'center',
  },
  
  replyMessageText: {
    fontSize: '14px',
    color: '#555',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  replyPanel: {
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '16px',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  
  replyInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    marginTop: '8px',
  },
  
  sendButton: {
    backgroundColor: '#128C7E',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    marginRight: '8px',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#0b6f5c',
    },
  },
  
  cancelButton: {
    backgroundColor: '#ddd',
    color: '#333',
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#bbb',
    },
  },
  

  
}));
