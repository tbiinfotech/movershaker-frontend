import React from 'react';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

interface Props {
  children: React.ReactNode;
}

const CustomThemeProvider = ({ children }: Props) => {
  const defaultTheme = createTheme({});

  const theme = createTheme({
    palette: {
      mode: 'light'
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            whiteSpace: 'nowrap'
          },

          '*::-webkit-scrollbar': {
            width: '10px'
          },

          '*::-webkit-scrollbar-track': {
            backgroundColor: 'transparent'
          },

          '*::-webkit-scrollbar-thumb': {
            backgroundColor: defaultTheme.palette.action.disabled,
            borderRadius: '20px',
            width: '10px'
          },

          [defaultTheme.breakpoints.down('sm')]: {
            '*::-webkit-scrollbar': {
              width: '0px'
            }
          }
        }
      },

      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: 0,
            marginRight: defaultTheme.spacing(1.5)
          }
        }
      },

      MuiInput: {
        styleOverrides: {
          root: {
            paddingRight: defaultTheme.spacing(2),
            paddingLeft: defaultTheme.spacing(2),
            paddingTop: defaultTheme.spacing(0.5),
            paddingBottom: defaultTheme.spacing(0.5),
            borderRadius: '50px',
            backgroundColor: defaultTheme.palette.action.hover
          }
        }
      }
    }

    // overrides: {
    //   MuiCssBaseline: {
    //     '@global': {
    //       html: {
    //         whiteSpace: 'nowrap',
    //       },

    //       '*::-webkit-scrollbar': {
    //         width: '10px',
    //       },

    //       '*::-webkit-scrollbar-track': {
    //         backgroundColor: 'transparent',
    //       },

    //       '*::-webkit-scrollbar-thumb': {
    //         backgroundColor: defaultTheme.palette.action.disabled,
    //         borderRadius: '20px',
    //         width: '10px',
    //       },

    //       [defaultTheme.breakpoints.down('sm')]: {
    //         '*::-webkit-scrollbar': {
    //           width: '0px',
    //         },
    //       },
    //     },
    //   },

    //   MuiListItemIcon: {
    //     root: {
    //       minWidth: 0,
    //       marginRight: defaultTheme.spacing(1.5),
    //     },
    //   },

    //   MuiInput: {
    //     root: {
    //       paddingRight: defaultTheme.spacing(2),
    //       paddingLeft: defaultTheme.spacing(2),
    //       paddingTop: defaultTheme.spacing(0.5),
    //       paddingBottom: defaultTheme.spacing(0.5),
    //       borderRadius: '50px',
    //       backgroundColor: defaultTheme.palette.action.hover,
    //     },
    //   },
    // },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default CustomThemeProvider;
