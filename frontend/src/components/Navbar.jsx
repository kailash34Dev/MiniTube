import { Link } from 'react-router-dom';
import { Menu, Search, Plus, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.svg';

export default function Navbar({ toggleSidebar }) {
  const { user } = useAuth();

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
      </div>

      <div className="navbar-end">
        {user ? (
          <>
            <Link to="/upload" className="btn btn-secondary" style={{ borderRadius: '9999px', padding: '0 16px', gap: '8px', textDecoration: 'none' }}>
              <Plus size={20} />
              Create
            </Link>
            <Link to="/dashboard" className="icon-btn">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
              ) : (
                <User size={24} />
              )}
            </Link>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary" style={{ borderRadius: '9999px', textDecoration: 'none' }}>
            <User size={20} style={{ marginRight: '8px' }} />
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
