import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Maps from './pages/Maps';
import Polls from './pages/Polls';
import Graphs from './pages/Graphs';
import About from './pages/About';
import Legacy from './pages/Legacy';
import './App.css';

const App: React.FC = () => {
  return (
    // Add basename here for compatibility with GitHub Pages
    <Router basename="/">
      <div className="app-container">
        {/* Top Header */}
        <header className="top-header stripe">
          <div className="left-box"></div>
          <svg className="left-curve" xmlns="http://www.w3.org/2000/svg" viewBox="-2 0 13 12">
            <path d="M -2 0 L 11 -0 C 10 -0 8 -0 7 4 L 6 8 C 5 12 3 12 2 12 L -2 12 L -2 0" />
          </svg>
          <div className="e-m-title"><h1>ElectionMap.lol</h1></div>
          <svg className="right-curve" xmlns="http://www.w3.org/2000/svg" viewBox="-11 -12 13 12">
            <path d="M 2 0 L -11 0 C -10 0 -8 0 -7 -4 L -6 -8 C -5 -12 -3 -12 -2 -12 L 2 -12 L 2 0" />
          </svg>
          <div className="right-box"></div>
        </header>

        {/* Second Header for Navigation */}
        <header className="nav-header">
          <Link to="/maps"><div className="nav-button"><p>Maps</p></div></Link>
          <Link to="/polls"><div className="nav-button"><p>Polls</p></div></Link>
          <Link to="/graphs"><div className="nav-button"><p>Graphs</p></div></Link>
          <Link to="/about"><div className="nav-button"><p>About</p></div></Link>
        </header>

        {/* Main Content */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/maps" replace />} />
            <Route path="/election-model" element={<Navigate to="/maps" replace />} />
            <Route path="/maps" element={<Maps layoutClass="maps-columns" />} />
            <Route path="/polls" element={<Polls layoutClass="two-column-layout" />} />
            <Route path="/graphs" element={<Graphs layoutClass="two-column-layout" />} />
            <Route path="/about" element={<About layoutClass="about-columns" />} />
            <Route path="/legacy" element={<Legacy />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
