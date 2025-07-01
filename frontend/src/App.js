import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';

// Importar componentes
import Dashboard from './components/Dashboard';
import Pacientes from './components/Pacientes';
import Clinicas from './components/Clinicas';
import Consultores from './components/Consultores';
import Agendamentos from './components/Agendamentos';
import Fechamentos from './components/Fechamentos';

// Ícones (usando emojis para simplicidade)
const NavItem = ({ to, icon, label, isActive }) => (
  <Link to={to} className={`nav-item ${isActive ? 'active' : ''}`}>
    <span className="nav-icon">{icon}</span>
    <span className="nav-label">{label}</span>
  </Link>
);

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { to: '/', icon: '📊', label: 'Dashboard' },
    { to: '/pacientes', icon: '👥', label: 'Pacientes' },
    { to: '/agendamentos', icon: '📅', label: 'Agendamentos' },
    { to: '/fechamentos', icon: '💰', label: 'Fechamentos' },
    { to: '/consultores', icon: '🩺', label: 'Consultores' },
    { to: '/clinicas', icon: '🏥', label: 'Clínicas' },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h2>🩺 CRM Saúde</h2>
      </div>
      <div className="nav-items">
        {navItems.map(item => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={location.pathname === item.to}
          />
        ))}
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pacientes" element={<Pacientes />} />
            <Route path="/agendamentos" element={<Agendamentos />} />
            <Route path="/fechamentos" element={<Fechamentos />} />
            <Route path="/consultores" element={<Consultores />} />
            <Route path="/clinicas" element={<Clinicas />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 