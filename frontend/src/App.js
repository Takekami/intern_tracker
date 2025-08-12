import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Feedback from './pages/Feedback';
import Reports from './pages/Reports';
import ReportDetail from './pages/ReportDetail';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:internId" element={<ReportDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
