import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const AppContext = createContext(null);
const ALERT_DURATION_MS = 5000;

export function AppProvider({ children }) {
  const [alert, setAlert] = useState(null);
  const timeoutRef = useRef(null);

  const clearAlert = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setAlert(null);
  }, []);

  const showAlert = useCallback(
    (type, message) => {
      if (!message) return;
      clearAlert();
      setAlert({ type, message });
      timeoutRef.current = setTimeout(() => {
        setAlert(null);
        timeoutRef.current = null;
      }, ALERT_DURATION_MS);
    },
    [clearAlert],
  );

  const value = useMemo(
    () => ({ alert, showAlert, clearAlert }),
    [alert, showAlert, clearAlert],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
