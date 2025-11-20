import React from 'react';
import { Provider } from 'react-redux';
import App from './App';
import CustomThemeProvider from './theme/CustomThemeProvider';
import { store } from '../../../../store/chatStore';
import { CssBaseline } from '@mui/material';

const Index = () => {
  return (
    <Provider store={store}>
      <CustomThemeProvider>
        <CssBaseline />
        <App />
      </CustomThemeProvider>
    </Provider>
  );
};

export default Index;
