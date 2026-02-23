import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Questions from './pages/Questions';
import Admin from './pages/Admin';
import Signup from './pages/Signup';
import ChangePassword from './pages/ChangePassword';
import './App.css';

function NavBar() {
  const { user, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin whenever user changes
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const session = await fetchAuthSession();
        const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] | undefined;
        setIsAdmin(groups?.includes('Admin') || false);
      } catch (error) {
        console.error('Error checking admin access:', error);
        setIsAdmin(false);
      }
    };

    checkAdminAccess();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          SkillScout
        </Link>
        <div className="navbar-links">
          <Link to="/questions" className="nav-link">
            Questions
          </Link>
          {user && isAdmin && (
            <Link to="/admin" className="nav-link admin-link">
              Admin Dashboard
            </Link>
          )}
          {user ? (
            <>
              <span className="user-email">
                {user.signInDetails?.loginId || user.username}
              </span>
              <button onClick={handleLogout} className="nav-link nav-button logout-btn">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-link">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <BrowserRouter>
      <div className="app">
        <NavBar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/change-password" element={<ChangePassword />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; 2026 SkillScout. Master your interviews with AI-powered practice.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
