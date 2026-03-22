import { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';

const ClientDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [localQuantities, setLocalQuantities] = useState({}); // { orderId: quantity }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/orders');
      setOrders(data);
      // Initialize local quantities
      const quantities = {};
      data.forEach(o => {
        quantities[o._id] = o.packagesToOrder || 0;
      });
      setLocalQuantities(quantities);
    } catch (err) {
      console.error(err);
      alert('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleLocalUpdate = (orderId, newVal) => {
    const amount = Math.max(0, parseInt(newVal) || 0);
    setLocalQuantities(prev => ({
      ...prev,
      [orderId]: amount
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const updates = Object.keys(localQuantities).map(id => ({
        id,
        packagesToOrder: localQuantities[id]
      }));
      await axios.put('/orders/bulk', { updates });
      alert('Pedido actualizado con éxito');
      fetchOrders(); // Refresh from server
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar el pedido');
    } finally {
      setSaving(false);
    }
  };

  // Calculations
  const totalVolume = orders.reduce((sum, o) => {
    const qty = localQuantities[o._id] || 0;
    return sum + (o.cbmPerPackage * qty);
  }, 0);

  const totalCost = orders.reduce((sum, o) => {
    const qty = localQuantities[o._id] || 0;
    return sum + (o.priceRmb * o.unitsPerPackage * qty);
  }, 0);

  // Check if there are changes compared to server data
  const hasChanges = orders.some(o => (localQuantities[o._id] || 0) !== (o.packagesToOrder || 0));

  return (
    <div className="pb-24">
      {/* Sticky Header with Totals */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 p-4 shadow-sm">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Volumen Total:</span>
              <span className="text-lg font-black text-blue-600">{totalVolume.toFixed(3)} m³</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Costo Total:</span>
              <span className="text-lg font-black text-emerald-600">¥ {totalCost.toLocaleString()}</span>
            </div>
          </div>
          
          <button 
            onClick={handleSaveAll}
            disabled={!hasChanges || saving}
            className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 ${
              hasChanges 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 active:scale-95' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            )}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      <div className="pt-6 px-4 max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Tus Productos</h1>
            <p className="text-sm text-slate-500">Ajusta las cantidades y presiona Guardar</p>
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
                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-tight">
                    {order.category}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-2xl font-bold text-emerald-600">¥ {order.priceRmb}</div>
                    <div className="text-right text-sm text-slate-500">
                      <p>{order.unitsPerPackage} cant / caja</p>
                      <p>{order.cbmPerPackage} CBM / caja</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-slate-700 font-medium">Cajas a asignar:</span>
                    <div className="flex items-center gap-2">
                      <button 
                        className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center active:bg-slate-200 transition"
                        onClick={() => handleLocalUpdate(order._id, (localQuantities[order._id] || 0) - 1)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                      </button>
                      
                      <input 
                        type="number"
                        className="w-12 text-center font-bold text-lg text-slate-800 bg-transparent border-b border-slate-300 focus:outline-none focus:border-orange-500"
                        value={localQuantities[order._id] || 0}
                        onChange={(e) => handleLocalUpdate(order._id, e.target.value)}
                      />
                      
                      <button 
                        className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center active:bg-emerald-200 transition"
                        onClick={() => handleLocalUpdate(order._id, (localQuantities[order._id] || 0) + 1)}
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
    </div>
  );
};

export default ClientDashboard;
