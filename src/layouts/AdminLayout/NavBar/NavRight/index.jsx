import React, { useState, useContext, useEffect } from 'react';
import { Card, ListGroup, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import PerfectScrollbar from 'react-perfect-scrollbar';
import DeleteModal from 'components/ConfirmModalMaterial';
// import io from 'socket.io-client';

import { AuthContext } from '../../../../contexts/AuthContext';

import ChatList from './ChatList';

import avatar1 from '../../../../assets/images/user/avatar-1.jpg';

// const apiUrl = import.meta.env.VITE_SERVER_URL;

const NavRight = () => {
  const [listOpen, setListOpen] = useState(false);
  const navigate = useNavigate();
  // const [uploadProgress, setUploadProgress] = useState({});
  const { logout } = useContext(AuthContext);
  const [openLogout, setOpenLogout] = useState(false);
  const [show, setshow] = useState(false);

  // useEffect(() => {
  //   const socket = io(apiUrl);

  //   socket.on('connect', () => {
  //     console.log('Socket connected:', socket.id);
  //   });

  //   socket.on('upload-progress', (data) => {
  //     setUploadProgress((prevProgress) => ({
  //       ...prevProgress,
  //       data
  //     }));
  //   });

  //   return () => {
  //     socket.disconnect();
  //     console.log('Socket disconnected'); // Log when the socket is disconnected
  //   };
  // }, []);

  return (
    <React.Fragment>
      <ListGroup as="ul" bsPrefix=" " className="navbar-nav ml-auto" id="navbar-right">
        <ListGroup.Item as="li" bsPrefix=" ">
          <Dropdown align={'end'} className="drp-user" show={show} onToggle={() => setshow(() => !show)}>
            <Dropdown.Toggle as={Link} variant="link" to="#" id="dropdown-basic">
              <i className="icon feather icon-settings" />
            </Dropdown.Toggle>
            <Dropdown.Menu align="end" className="profile-notification">
              <div className="pro-head">
                <img src={avatar1} className="img-radius" alt="User Profile" />
                <span>John Doe</span>
                {/* <Link to="#" className="dud-logout" title="Logout" onClick={logout}>
                  <i className="feather icon-log-out" />
                </Link> */}
              </div>
              <ListGroup as="ul" bsPrefix=" " variant="flush" className="pro-body">
                <ListGroup.Item as="li" bsPrefix=" ">
                  <Link to="/setting" className="dropdown-item" onClick={() => setshow(false)}>
                    <i className="feather icon-settings" /> Settings
                  </Link>
                </ListGroup.Item>
                {/* <ListGroup.Item as="li" bsPrefix=" ">
                  <Link to="#" className="dropdown-item">
                    <i className="feather icon-user" /> Profile
                  </Link>
                </ListGroup.Item>
                <ListGroup.Item as="li" bsPrefix=" ">
                  <Link to="#" className="dropdown-item">
                    <i className="feather icon-mail" /> My Messages
                  </Link>
                </ListGroup.Item>
                <ListGroup.Item as="li" bsPrefix=" ">
                  <Link to="#" className="dropdown-item">
                    <i className="feather icon-lock" /> Lock Screen
                  </Link>
                </ListGroup.Item> */}
                <ListGroup.Item as="li" bsPrefix=" ">
                  <Link to="/auth/change-password" className="dropdown-item" onClick={() => setshow(false)}>
                    <i className="feather icon-edit" /> Change Password
                  </Link>
                </ListGroup.Item>
                <ListGroup.Item as="li" bsPrefix=" ">
                  <Link
                    to="#"
                    className="dropdown-item"
                    onClick={() => {
                      setOpenLogout(true);
                      setshow(false);
                    }}
                  >
                    <i className="feather icon-log-out" /> Logout
                  </Link>
                </ListGroup.Item>
              </ListGroup>
            </Dropdown.Menu>
          </Dropdown>
        </ListGroup.Item>
      </ListGroup>
      <ChatList listOpen={listOpen} closed={() => setListOpen(false)} />

      <DeleteModal
        open={openLogout}
        handleClose={() => setOpenLogout(false)}
        children={
          <>
            <p>Are you sure you want to logout!</p>
          </>
        }
        callBack={() => {
          logout();
          setOpenLogout(false);
        }}
      />
    </React.Fragment>
  );
};

export default NavRight;
