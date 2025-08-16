import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Feedback from './pages/Feedback';
import Reports from './pages/Reports';
import ReportDetail from './pages/ReportDetail';
import { useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const token = user?.token;
  return token ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ allow = [], children }) => {
  const { user } = useAuth();
  const role = user?.user?.role || user?.role;
  const token = user?.token;
  if (!token) return <Navigate to="/login" replace />;
  if (!allow.includes(role)) return <Navigate to="/forbidden" replace />;
  return children;
};

const Forbidden = () => <div style={{ padding: 24 }}>403 Forbidden</div>;

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* profile */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Mentor/Intern can access tasks. Change the UI based on role. */}
        <Route
          path="/tasks"
          element={
              <RoleRoute allow={['mentor', 'intern']}>
                <Tasks />
              </RoleRoute>
          }
        />

        {/* Only Mentor */}
        <Route
          path="/feedback"
          element={
              <RoleRoute allow={['mentor']}>
                <Feedback />
              </RoleRoute>
          }
        />
        {/* Only Mentor */}
        <Route
          path="/reports"
          element={
              <RoleRoute allow={['mentor']}>
                <Reports />
              </RoleRoute>
          }
        />
        <Route
          path="/reports/:internId"
          element={
              <RoleRoute allow={['mentor']}>
                <ReportDetail />
              </RoleRoute>
          }
        />

        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="/" element={<Navigate to="/tasks" replace />} />
        <Route path="*" element={<Navigate to="/tasks" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
