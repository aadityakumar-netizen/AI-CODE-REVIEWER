import { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';

import { checkHealth } from '../services/api';
import { useAuth } from '../context/AuthContext';

import './Layout.css';

function Layout({ children }) {
  const [backendStatus, setBackendStatus] = useState('checking');

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        await checkHealth();
        if (mounted) setBackendStatus('connected');
      } catch {
        if (mounted) setBackendStatus('disconnected');
      }
    }

    check();
    const interval = setInterval(check, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="layout">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">
            AI Code Reviewer
          </Link>

          <div className="topbar-right">
            <span className={`status status-${backendStatus}`}>
              <span className="status-dot" />

              {backendStatus === 'checking' &&
                'Checking backend...'}

              {backendStatus === 'connected' &&
                'Backend connected'}

              {backendStatus === 'disconnected' &&
                'Backend unreachable'}
            </span>

            {isAuthenticated ? (
              <>
                <nav className="nav">
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      isActive
                        ? 'nav-link active'
                        : 'nav-link'
                    }
                  >
                    Review
                  </NavLink>

                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      isActive
                        ? 'nav-link active'
                        : 'nav-link'
                    }
                  >
                    Dashboard
                  </NavLink>

                  <NavLink
                    to="/github"
                    className={({ isActive }) =>
                      isActive ? 'nav-link active' : 'nav-link'
                    }
                  >
                    GitHub
                  </NavLink>

                  <NavLink
                    to="/history"
                    className={({ isActive }) =>
                      isActive
                        ? 'nav-link active'
                        : 'nav-link'
                    }
                  >
                    History
                  </NavLink>
                </nav>

                <div className="user-menu">
                  <span className="user-email">
                    {user?.email}
                  </span>

                  <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <nav className="auth-nav">
                <Link to="/login" className="auth-nav-link">
                  Login
                </Link>

                <Link
                  to="/register"
                  className="auth-nav-button"
                >
                  Register
                </Link>
              </nav>
            )}
          </div>
        </div>
      </header>

      <main className="content">{children}</main>
    </div>
  );
}

export default Layout;