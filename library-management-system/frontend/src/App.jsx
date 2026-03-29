import React, { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import LibrarianDashboard from './LibrarianDashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('library_token');
    const userRole = localStorage.getItem('library_user_role');
    if (token) {
      setIsAuthenticated(true);
      setRole(userRole);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setRole(localStorage.getItem('library_user_role'));
  };

  const handleLogout = () => {
    localStorage.removeItem('library_token');
    localStorage.removeItem('library_user_id');
    localStorage.removeItem('library_user_name');
    localStorage.removeItem('library_user_role');
    setIsAuthenticated(false);
    setRole(null);
  };

  return (
    <>
      {isAuthenticated ? (
        role === 'librarian' || role === 'admin' ? (
          <LibrarianDashboard onLogout={handleLogout} />
        ) : (
          <Dashboard onLogout={handleLogout} />
        )
      ) : (
        <Login onLoginSuccess={handleLogin} />
      )}
    </>
  );
}

export default App;
