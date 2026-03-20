import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post('/auth/login', { username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'ADMIN') navigate('/admin');
      if (data.user.role === 'AGENT') navigate('/agent');
      if (data.user.role === 'CLIENT') navigate('/client');
    } catch (err) {
      setError(err.response?.data?.message || 'Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-sm p-8 animate-fade-in-up">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-green-400 to-emerald-600 rounded-2xl mx-auto shadow-lg shadow-green-500/40 flex items-center justify-center mb-4 transform -rotate-6">
            <span className="text-white text-3xl font-bold">Y</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Yiwu Market</h1>
          <p className="text-sm text-slate-500 mt-1">Ingresa para continuar</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`btn-primary mt-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;
