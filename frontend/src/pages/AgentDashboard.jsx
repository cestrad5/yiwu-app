import { useState, useEffect, useRef } from 'react';
import axios from '../utils/axiosConfig';
import imageCompression from 'browser-image-compression';

const AgentDashboard = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [category, setCategory] = useState('');
  const [priceRmb, setPriceRmb] = useState('');
  const [unitsPerPackage, setUnitsPerPackage] = useState('');
  const [cbmPerPackage, setCbmPerPackage] = useState('');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  
  // New Fields
  const [shop, setShop] = useState('');
  const [contact, setContact] = useState('');
  const [shopRef, setShopRef] = useState('');
  const [phone, setPhone] = useState('');
  const [measure, setMeasure] = useState('');
  const [weight, setWeight] = useState('');
  const [color, setColor] = useState('');
  const [item, setItem] = useState('');
  const [packagingType, setPackagingType] = useState('');
  const [barcode, setBarcode] = useState('');
  const [unit, setUnit] = useState('unid');
  
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    // Agents need a list of clients they are assigned to. 
    // In our backend, the admin assigns an agent TO a client. 
    // Let's fetch all users, and filter clients who have this agent assigned.
    const fetchClients = async () => {
      try {
        const { data } = await axios.get('/auth/my-clients');
        setClients(data);
        if (data.length > 0) setSelectedClient(data[0]._id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClients();
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo) return alert('La foto es requerida');
    if (!selectedClient) return alert('Debes seleccionar un cliente');

    setLoading(true);
    let finalPhoto = photo;

    // Compression
    try {
      const options = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1200,
        useWebWorker: true
      };
      
      const compressedFile = await imageCompression(photo, options);
      // We keep the original filename but change the blob
      finalPhoto = new File([compressedFile], photo.name, { type: photo.type });
    } catch (compressionError) {
      console.warn('Compression failed, using original photo', compressionError);
    }

    const formData = new FormData();
    formData.append('clientId', selectedClient);
    formData.append('category', category);
    formData.append('priceRmb', priceRmb);
    formData.append('unitsPerPackage', unitsPerPackage);
    formData.append('cbmPerPackage', cbmPerPackage);
    formData.append('photo', finalPhoto);

    // New Fields
    formData.append('shop', shop);
    formData.append('contact', contact);
    formData.append('shopRef', shopRef);
    formData.append('phone', phone);
    formData.append('measure', measure);
    formData.append('weight', weight);
    formData.append('color', color);
    formData.append('packagingType', packagingType);
    formData.append('barcode', barcode);
    formData.append('unit', unit);

    try {
      await axios.post('/orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Producto registrado exitosamente');
      // Reset form
      setCategory('');
      setPriceRmb('');
      setUnitsPerPackage('');
      setCbmPerPackage('');
      // Reset new fields
      setShop('');
      setContact('');
      setShopRef('');
      setPhone('');
      setMeasure('');
      setWeight('');
      setColor('');
      setPackagingType('');
      setBarcode('');
      setUnit('unid');

      setPhoto(null);
      setPreview(null);
      if(fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Registro de productos</h1>
        </div>
        <button className="text-sm text-red-500 font-semibold" onClick={() => { localStorage.clear(); window.location.href='/'; }}>Salir</button>
      </div>

      <div className="glass-card p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente Actual</label>
            <select 
              value={selectedClient} 
              onChange={e => setSelectedClient(e.target.value)} 
              className="input-field bg-white" 
              required
            >
              <option value="">Selecciona un cliente</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.username}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Foto del Producto</label>
            
            <div 
              className="w-full h-48 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 overflow-hidden relative transition"
            >
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="w-full h-full object-contain bg-slate-200" onClick={() => fileInputRef.current?.click()} />
                  <button 
                    type="button"
                    onClick={() => { setPhoto(null); setPreview(null); }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </>
              ) : (
                <div className="text-center p-4 w-full h-full flex flex-col items-center justify-center">
                  <div 
                    className="flex-1 w-full flex flex-col items-center justify-center cursor-pointer active:bg-slate-100 transition"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="bg-emerald-100 text-emerald-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </div>
                    <span className="text-slate-500 text-sm font-medium">Tocar para Tomar Foto</span>
                  </div>
                  
                  <div className="w-full border-t border-slate-200 pt-2 pb-1">
                    <button 
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center justify-center gap-1 mx-auto hover:text-emerald-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      Seleccionar de Galería
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={fileInputRef} 
              onChange={handlePhotoChange} 
              className="hidden" 
            />
            <input 
              type="file" 
              accept="image/*" 
              ref={galleryInputRef} 
              onChange={handlePhotoChange} 
              className="hidden" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 uppercase tracking-tight text-[11px]">Descripción</label>
              <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="input-field !px-3 !py-2" placeholder="Ej: Juguetes" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 uppercase tracking-tight text-[11px]">Precio (RMB)</label>
              <input type="number" step="0.01" value={priceRmb} onChange={e => setPriceRmb(e.target.value)} className="input-field !px-3 !py-2" placeholder="0.00" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 uppercase tracking-tight text-[11px]">Cant / Caja</label>
              <input type="number" value={unitsPerPackage} onChange={e => setUnitsPerPackage(e.target.value)} className="input-field !px-3 !py-2" placeholder="Ej: 12" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 uppercase tracking-tight text-[11px]">CBM / Caja</label>
              <input type="number" step="0.001" value={cbmPerPackage} onChange={e => setCbmPerPackage(e.target.value)} className="input-field !px-3 !py-2" placeholder="0.000" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-4 border-t border-slate-100 pt-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-tight text-[10px]">Shop No</label>
              <input type="text" value={shop} onChange={e => setShop(e.target.value)} className="input-field !px-2 !py-1 text-sm" placeholder="No. Local" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-tight text-[10px]">Nota</label>
              <input type="text" value={contact} onChange={e => setContact(e.target.value)} className="input-field !px-2 !py-1 text-sm" placeholder="Observaciones" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-tight text-[10px]">Teléfono</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="input-field !px-2 !py-1 text-sm" placeholder="Num móvil" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-tight text-[10px]">Tamaño</label>
              <input type="text" value={measure} onChange={e => setMeasure(e.target.value)} className="input-field !px-2 !py-1 text-sm" placeholder="Ej: 50x30cm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-tight text-[10px]">Peso</label>
              <input type="text" value={weight} onChange={e => setWeight(e.target.value)} className="input-field !px-2 !py-1 text-sm" placeholder="Ej: 2.5kg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-tight text-[10px]">Color</label>
              <input type="text" value={color} onChange={e => setColor(e.target.value)} className="input-field !px-2 !py-1 text-sm" placeholder="Surtido/Rojo" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-tight text-[10px]">Unit</label>
              <input type="text" value={unit} onChange={e => setUnit(e.target.value)} className="input-field !px-2 !py-1 text-sm" placeholder="unid/set/pack" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-tight text-[10px]">Tipo Empaque</label>
              <input type="text" value={packagingType} onChange={e => setPackagingType(e.target.value)} className="input-field !px-2 !py-1 text-sm" placeholder="Caja/Bolsa" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-tight text-[10px]">Cód. Barras</label>
              <input type="text" value={barcode} onChange={e => setBarcode(e.target.value)} className="input-field !px-2 !py-1 text-sm" placeholder="EAN-13 / UPC" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={`btn-primary shadow-xl mt-6 text-lg py-4 flex items-center justify-center gap-3 ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Subiendo y Guardando...
              </>
            ) : 'Registrar Producto (Traductor)'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgentDashboard;
