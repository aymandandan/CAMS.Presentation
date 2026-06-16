import * as React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import type { ThemeOptions } from "@mui/material/styles";
import { colorSchemes, typography, shadows, shape } from "./themePrimitives";
import * as customizations from "./customizations";
import "./styles/printing.css";

interface AppThemeProps {
  children: React.ReactNode;
  disableCustomTheme?: boolean;
  themeComponents?: ThemeOptions["components"];
}

export default function AppTheme(props: AppThemeProps) {
  const { children, disableCustomTheme, themeComponents } = props;
  const theme = React.useMemo(() => {
    return disableCustomTheme
      ? {}
      : createTheme({
          cssVariables: {
            colorSchemeSelector: "data-mui-color-scheme",
            cssVarPrefix: "cams",
          },
          colorSchemes,
          typography,
          shadows,
          shape,
          components: {
            // Custom scrollbar – thin and elegant
            MuiCssBaseline: {
              styleOverrides: {
                body: {
                  scrollbarWidth: "thin", // Firefox
                  scrollbarColor: "rgba(128,128,128,0.3) transparent",
                },
                "*::-webkit-scrollbar": {
                  width: 6,
                  height: 6,
                },
                "*::-webkit-scrollbar-track": {
                  background: "transparent",
                },
                "*::-webkit-scrollbar-thumb": {
                  background: "rgba(128,128,128,0.3)",
                  borderRadius: 3,
                },
                "*::-webkit-scrollbar-thumb:hover": {
                  background: "rgba(128,128,128,0.5)",
                },
              },
            },
            ...customizations.inputsCustomizations,
            ...customizations.dataDisplayCustomizations,
            ...customizations.feedbackCustomizations,
            ...customizations.navigationCustomizations,
            ...customizations.surfacesCustomizations,
            ...customizations.dataGridCustomizations,
            ...customizations.datePickersCustomizations,
            ...customizations.sidebarCustomizations,
            ...customizations.formInputCustomizations,
            ...themeComponents,
          },
        });
  }, [disableCustomTheme, themeComponents]);

  if (disableCustomTheme) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  return (
    <ThemeProvider theme={theme} disableTransitionOnChange>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
