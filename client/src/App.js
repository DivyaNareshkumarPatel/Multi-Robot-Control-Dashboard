import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
// import Signup from './Pages/Signup';
import AdminDashboard from './Pages/AdminDashboard';
import Dashboard from './Pages/Dashboard';
import ProtectedRoute from './Components/ProtectedRoute';
import RobotAdmin from './Pages/RobotAdmin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/signup" element={<Signup />} /> */}
        <Route 
          path="/adminDashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requiredRole="robot_operator">
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/robot_admin_dashboard" 
          element={
            <ProtectedRoute requiredRole="robot_admin">
              <RobotAdmin />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
