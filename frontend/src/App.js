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
  return user ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ allow, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return allow.includes(user.role) ? children : <Navigate to="/forbidden" replace />;
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
            <PrivateRoute>
              <RoleRoute allow={['mentor', 'intern']}>
                <Tasks />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        {/* Only Mentor */}
        <Route
          path="/feedback"
          element={
            <PrivateRoute>
              <RoleRoute allow={['mentor']}>
                <Feedback />
              </RoleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <RoleRoute allow={['mentor']}>
                <Reports />
              </RoleRoute>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/:internId"
          element={
            <PrivateRoute>
              <RoleRoute allow={['mentor']}>
                <ReportDetail />
              </RoleRoute>
            </PrivateRoute>
          }
        />

        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<Navigate to="/profile" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
