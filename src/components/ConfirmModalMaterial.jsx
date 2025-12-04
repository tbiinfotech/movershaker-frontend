import { Button, IconButton, Typography, Box, Modal } from '@mui/material';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
const mainBox = {
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '500px',
  maxWidth: '35dvw',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: '8px',
  overflow: 'hidden'
};

const titleBar = {
  display: 'flex',
  justifyContent: 'space-between',
  //   borderBottom: '1px solid #04a9f5',
  padding: '15px 15px 0px 15px',
  alignItems: 'center',
  color: 'black'
};
const bottomBar = {
  display: 'flex',
  //   justifyContent: "space-between",
  flexDirection: 'row-reverse',
  gap: '10px',

  //   borderTop: '1px solid rgba(61, 71, 81, 0.3)',
  padding: '0px 15px 15px 15px'
};

const content = {
  padding: '12px 15px',
  color: 'black',
  fontSize: '16px'
};
const DeleteModal = ({ open, handleClose, callBack, callbackInput, children }) => {
  return (
    <>
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={mainBox}>
          <Box sx={titleBar}>
            <Typography component={'p'} sx={{ fontSize: '22px', fontWeight: '700' }}>
              Confirm
            </Typography>
            <IconButton onClick={() => handleClose(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={content}>{children}</Box>
          <Box sx={bottomBar}>
            <Button onClick={() => callBack(callbackInput?.data)} sx={{ color: 'red' }}>
              Yes
            </Button>
            <Button onClick={() => handleClose(false)} sx={{ color: 'black' }}>
              No
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default DeleteModal;
