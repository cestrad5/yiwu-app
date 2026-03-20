import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import ClientDashboard from './pages/ClientDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      
      {/* Protected routes for Admin */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Protected routes for Agent */}
      <Route element={<ProtectedRoute allowedRoles={['AGENT']} />}>
        <Route path="/agent" element={<AgentDashboard />} />
      </Route>

      {/* Protected routes for Client */}
      <Route element={<ProtectedRoute allowedRoles={['CLIENT']} />}>
        <Route path="/client" element={<ClientDashboard />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
