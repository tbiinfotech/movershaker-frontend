import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ConfigProvider } from './contexts/ConfigContext';
import AuthProvider from './contexts/AuthContext'; // Import AuthProvider
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.scss';
import App from './App';
import { store } from './store';
import reportWebVitals from './reportWebVitals';
import 'bootstrap-icons/font/bootstrap-icons.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <ConfigProvider>
      <AuthProvider>
        <ToastContainer />
        <App />
      </AuthProvider>
    </ConfigProvider>
  </Provider>
);

reportWebVitals();
