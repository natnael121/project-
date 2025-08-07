import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MenuPage } from './pages/MenuPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/table/:tableNumber" element={<MenuPage />} />
        <Route path="/" element={<Navigate to="/table/1" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
