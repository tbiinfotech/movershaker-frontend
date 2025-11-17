import React, { useEffect, useContext } from 'react';
import { BrowserRouter } from 'react-router-dom';
import routes, { renderRoutes } from './routes';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { updateUserStatus, chatAuth } from './services/firebase';
import { AuthContext } from './contexts/AuthContext';

const apiUrl = import.meta.env.VITE_SERVER_URL;

const App = () => {
  const dispatch = useDispatch();
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/student/programs`);
        dispatch({ type: 'FETCH_PROGRAMS', data: response.data.data });
      } catch (err) {
        console.error('Error fetching programs:', err);
      }
    };

    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/student`);
        dispatch({ type: 'FETCH_STUDENTS', data: response.data.data });
      } catch (err) {
        console.error('Error fetching student:', err);
      }
    };

    fetchPrograms();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!auth?.user) return;

    let userId = auth?.user._id;

    updateUserStatus(userId, true);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateUserStatus(userId, false);
      } else {
        updateUserStatus(userId, true);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      updateUserStatus(userId, false);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [auth]);

  return <BrowserRouter basename={import.meta.env.VITE_APP_BASE_NAME}>{renderRoutes(routes)}</BrowserRouter>;
};

export default App;
