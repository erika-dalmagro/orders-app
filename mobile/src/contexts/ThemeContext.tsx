import React, { createContext, useState, useMemo, ReactNode, useContext } from 'react';
import { MD3DarkTheme, MD3LightTheme, useTheme } from 'react-native-paper';

interface ThemeContextType {
  isDarkTheme: boolean;
  toggleTheme: () => void;
  theme: ReturnType<typeof useTheme>;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDarkTheme: false,
  toggleTheme: () => {},
  theme: MD3LightTheme,
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const theme = isDarkTheme ? MD3DarkTheme : MD3LightTheme;

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const value = useMemo(
    () => ({
      isDarkTheme,
      toggleTheme,
      theme,
    }),
    [isDarkTheme, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = (): ThemeContextType => useContext(ThemeContext);