import React from 'react';
import useStore, { StoreContext } from './Store';
import App from './App';
import AuthProvider from './AuthProvider';

const AppHost = () => {
  const store = useStore();

  return (
    <StoreContext.Provider value={store}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StoreContext.Provider>
  );
};

export default AppHost;
