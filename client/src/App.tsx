import React from 'react';
import { Route, Routes } from "react-router-dom";
import './App.css';
import Login from './pages/Login';
import Home from './pages/Home';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/*" element={<Login />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path='/home' element={<Home />}></Route>
      </Routes>
    </div>
  );
}

export default App;
