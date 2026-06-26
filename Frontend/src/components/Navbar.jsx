import { Link } from 'react-router-dom';
import { Menu, Search, Mic, Plus, Bell, User } from 'lucide-react';
import logo from '../assets/logo.svg';

export default function Navbar({ toggleSidebar }) {
  return (
    <nav className="navbar">
      <div className="navbar-start">
        {toggleSidebar && (
          <button className="icon-btn" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
        )}
        <Link to="/" className="logo-container">
          <img src={logo} alt="MiniTube" className="logo-icon" />
          MiniTube
        </Link>
      </div>

      <div className="navbar-center">
        <form className="search-form" onSubmit={(e) => e.preventDefault()}>
          <div className="search-input-wrapper">
            <input type="text" placeholder="Search" className="search-input" />
          </div>
          <button type="submit" className="search-btn">
            <Search size={20} />
          </button>
        </form>
        <button className="icon-btn mic-btn">
          <Mic size={20} />
        </button>
      </div>

      <div className="navbar-end">
        <Link to="/upload" className="btn btn-secondary" style={{ borderRadius: '9999px', padding: '0 16px', gap: '8px', textDecoration: 'none' }}>
          <Plus size={20} />
          Create
        </Link>
        <button className="icon-btn">
          <Bell size={20} />
        </button>
        <Link to="/dashboard" className="icon-btn">
          <User size={24} />
        </Link>
      </div>
    </nav>
  );
}
