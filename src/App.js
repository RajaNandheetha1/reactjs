import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';

const App = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
    </Routes>
  </Router>
);

export default App;
