import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.user?.role || user?.role || null;
  const isAuthed = !!user?.token;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
      <Link to="/" className="font-bold text-xl">Intern Task Manager</Link>

      <div className="space-x-6">
        {isAuthed && <Link to="/tasks">Tasks</Link>}

        {/* only mentor */}
        {role === 'mentor' && <Link to="/feedback">Feedbacks</Link>}
        {role === 'mentor' && <Link to="/reports">Reports</Link>}

        {isAuthed && <Link to="/profile">Profile</Link>}

        {isAuthed ? (
          <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">Logout</button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
