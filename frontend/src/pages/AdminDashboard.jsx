import { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for new user
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('CLIENT');

  // Assign agent
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/auth/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
      alert('Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/register', { username: newUsername, password: newPassword, role: newRole });
      alert('Usuario creado con éxito');
      setNewUsername('');
      setNewPassword('');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al crear usuario');
    }
  };

  const handleAssignAgent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/assign-agent', { clientId: selectedClient, agentId: selectedAgent });
      alert('Agente asignado con éxito');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al asignar agente');
    }
  };

  const handleExport = async (clientId, clientName) => {
    try {
      const response = await axios.get(`/orders/export/${clientId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders_${clientName}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Error al exportar, verifica los logs');
    }
  };

  const clients = users.filter(u => u.role === 'CLIENT');
  const agents = users.filter(u => u.role === 'AGENT');

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Panel de Administración</h1>
        <button className="text-sm bg-slate-200 text-slate-700 px-4 py-2 rounded-lg" onClick={() => { localStorage.clear(); window.location.href='/'; }}>Cerrar Sesión</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Create User Card */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Crear Nuevo Usuario</h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <input type="text" placeholder="Nombre de Usuario" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="input-field" required />
            <input type="password" placeholder="Contraseña" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field" required />
            <select value={newRole} onChange={e => setNewRole(e.target.value)} className="input-field bg-white">
              <option value="CLIENT">Cliente</option>
              <option value="AGENT">Agente</option>
              <option value="ADMIN">Administrador</option>
            </select>
            <button type="submit" className="btn-primary">Crear Usuario</button>
          </form>
        </div>

        {/* Assign Agent Card */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Asignar Agente a Cliente</h2>
          <form onSubmit={handleAssignAgent} className="space-y-4">
            <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="input-field bg-white" required>
              <option value="">-- Seleccionar Cliente --</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.username}</option>)}
            </select>
            <select value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)} className="input-field bg-white" required>
              <option value="">-- Seleccionar Agente --</option>
              {agents.map(a => <option key={a._id} value={a._id}>{a.username}</option>)}
            </select>
            <button type="submit" className="btn-primary bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/30">Asignar Agente</button>
          </form>
        </div>
      </div>

      {/* Clients List & Export */}
      <div className="glass-card p-6 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">Lista de Clientes y Exportación</h2>
        {loading ? <p>Cargando...</p> : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 px-4 text-slate-600">Cliente</th>
                <th className="py-3 px-4 text-slate-600">Agente Asignado</th>
                <th className="py-3 px-4 text-slate-600 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 font-medium text-slate-800">{client.username}</td>
                  <td className="py-3 px-4 text-slate-500">{client.assignedAgentId?.username || 'Ninguno'}</td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => handleExport(client._id, client.username)}
                      className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-200 transition"
                    >
                      Exportar Excel
                    </button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && <tr><td colSpan="3" className="py-4 text-center text-slate-500">No hay clientes creados.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
