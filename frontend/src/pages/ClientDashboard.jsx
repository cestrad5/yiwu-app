import { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';

const ClientDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/orders');
      setOrders(data);
    } catch (err) {
      console.error(err);
      alert('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePackages = async (orderId, val) => {
    // Only allow positive integers
    const amount = parseInt(val) || 0;
    
    try {
      await axios.put(`/orders/${orderId}`, { packagesToOrder: amount });
      
      // Optimistic update
      setOrders(orders.map(o => o._id === orderId ? { ...o, packagesToOrder: amount } : o));
    } catch (err) {
      alert('Error updating order');
      fetchOrders(); // Revert on failure
    }
  };

  return (
    <div className="pb-10 pt-6 px-4 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tus Productos</h1>
          <p className="text-sm text-slate-500">Mercado de Yiwu</p>
        </div>
        <button className="text-sm bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg" onClick={() => { localStorage.clear(); window.location.href='/'; }}>Salir</button>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-10 animate-pulse">Cargando productos...</div>
      ) : (
        <div className="space-y-6">
          {orders.length === 0 && (
            <div className="text-center text-slate-500 py-10 bg-slate-100 rounded-xl">No hay productos registrados aún.</div>
          )}
          
          {orders.map(order => (
            <div key={order._id} className="glass-card overflow-hidden">
              <div className="h-48 w-full bg-slate-200 relative">
                <img src={order.photoUrl} alt="Product" className="w-full h-full object-contain" loading="lazy" />
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
                  {order.category}
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-2xl font-bold text-emerald-600">¥ {order.priceRmb}</div>
                  <div className="text-right text-sm text-slate-500">
                    <p>{order.unitsPerPackage} unid/pqte</p>
                    <p>{order.cbmPerPackage} CBM/pqte</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Paquetes a ordenar:</span>
                  <div className="flex items-center gap-2">
                    <button 
                      className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center active:bg-slate-200 transition"
                      onClick={() => handleUpdatePackages(order._id, Math.max(0, order.packagesToOrder - 1))}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                    </button>
                    
                    <span className="w-10 text-center font-bold text-lg text-slate-800">{order.packagesToOrder}</span>
                    
                    <button 
                      className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center active:bg-emerald-200 transition"
                      onClick={() => handleUpdatePackages(order._id, order.packagesToOrder + 1)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
