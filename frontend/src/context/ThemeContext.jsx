import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check if user has previously set a theme preference
    const savedTheme = localStorage.getItem('theme');
    // Check if user's system prefers dark mode
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Use saved theme if available, otherwise use system preference
    return savedTheme ? savedTheme === 'dark' : prefersDarkMode;
  });

  const toggleTheme = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      // Save theme preference to localStorage
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  // Apply theme to document element
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  const value = {
    darkMode,
    toggleTheme
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
