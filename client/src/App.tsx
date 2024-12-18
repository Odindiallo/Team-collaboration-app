import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';
import './App.css';

// Import pages
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Tasks from './pages/Tasks';
import Documents from './pages/Documents';
import NewDocument from './pages/NewDocument';
import NewTask from './pages/NewTask';
import KeyboardShortcuts from './components/KeyboardShortcuts';

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Router>
      <KeyboardShortcuts />
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/chat" 
          element={isAuthenticated ? <Chat /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/tasks" 
          element={isAuthenticated ? <Tasks /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/tasks/new" 
          element={isAuthenticated ? <NewTask /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/documents" 
          element={isAuthenticated ? <Documents /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/documents/new" 
          element={isAuthenticated ? <NewDocument /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
