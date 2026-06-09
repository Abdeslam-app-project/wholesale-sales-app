import { db, User, Client, Visit, Product } from '../mockData';
import { TranslationSchema } from '../translations';

import {
  MapPin, Clock, ShoppingCart,
  DollarSign, FileText, Camera, Mic, Volume2,
  Trash2, RefreshCw
} from 'lucide-react';

interface MobileSimulatorProps {
  currentLang: 'en' | 'fr' | 'ar';
  isDark: boolean;
  t: TranslationSchema;
}

export const MobileSimulator: React.FC<MobileSimulatorProps> = ({ currentLang, isDark, t }) => {
  // Mobile app state
  const [activeRepId, setActiveRepId] = useState<string>('user-rep-01');
  const [activeScreen, setActiveScreen] = useState<'home' | 'clients' | 'catalog' | 'expenses' | 'orders' | 'logs'>('home');
  
  // Simulated Location Controls
  const [simulatedLat, setSimulatedLat] = useState<number>(48.8690); // Near Paris Fashion Hub
  const [simulatedLng, setSimulatedLng] = useState<number>(2.3070);
  
  // Lists
  const [reps, setReps] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Visit Track state
  const [activeVisit, setActiveVisit] = useState<Visit | null>(null);
  const [visitNotes, setVisitNotes] = useState<string>('');
  const [visitPhoto, setVisitPhoto] = useState<string>('');
  const [voiceNoteDuration, setVoiceNoteDuration] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string>('');
  const [radiusWarning, setRadiusWarning] = useState<boolean>(false);
  
  // Order Cart state
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [cartClientId, setCartClientId] = useState<string>('');
  
  // Expense Form state
  const [expenseCategory, setExpenseCategory] = useState<'Diesel' | 'Highway tolls' | 'Hotel' | 'Meals' | 'Other expenses'>('Diesel');
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [expenseNotes, setExpenseNotes] = useState<string>('');
  const [expensePhoto, setExpensePhoto] = useState<string>('');

  // Load database entities
  const loadData = () => {
    const allUsers = db.getUsers();
    setReps(allUsers.filter(u => u.role === 'sales_rep'));
    setClients(db.getClients());
    setProducts(db.getProducts());
    
    // Find active check-in
    const allVisits = db.getVisits();
    const currentActive = allVisits.find(v => v.sales_rep_id === activeRepId && !v.check_out_time);
    setActiveVisit(currentActive || null);
  };

  useEffect(() => {
    loadData();
    // Listen for database updates
    const handleUpdate = () => loadData();
    window.addEventListener('mock_db_update', handleUpdate);
    return () => window.removeEventListener('mock_db_update', handleUpdate);
  }, [activeRepId]);

  // Sync simulated coordinates based on chosen rep
  useEffect(() => {
    const currentRep = reps.find(r => r.id === activeRepId);
    if (currentRep && currentRep.current_lat && currentRep.current_lng) {
      setSimulatedLat(currentRep.current_lat);
      setSimulatedLng(currentRep.current_lng);
    }
  }, [activeRepId, reps]);

  // Handle Representative coordinate movement
  const updateRepLocation = (lat: number, lng: number) => {
    setSimulatedLat(lat);
    setSimulatedLng(lng);
    db.updateUserLocation(activeRepId, lat, lng);
  };

  // Move simulated location directly to a Client location (to pass GPS check)
  const snapToClient = (client: Client) => {
    updateRepLocation(client.latitude, client.longitude);
  };

  // Calculate Distance (meters)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // in meters
  };

  // Handle Check-in
  const handleCheckIn = (client: Client) => {
    // Check GPS Radius limit (e.g. 200m)
    const distance = calculateDistance(simulatedLat, simulatedLng, client.latitude, client.longitude);
    const isOut = distance > 200;
    setRadiusWarning(isOut);

    const newVisit: Omit<Visit, 'id'> = {
      client_id: client.id,
      sales_rep_id: activeRepId,
      check_in_time: new Date().toISOString(),
      check_in_lat: simulatedLat,
      check_in_lng: simulatedLng,
      notes: ''
    };
    
    const visitObj = db.addVisit(newVisit);
    setActiveVisit(visitObj);
    setVisitNotes('');
    setVisitPhoto('');
    setVoiceNoteUrl('');
    setVoiceNoteDuration(0);
  };

  // Simulate Recording voice note
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setVoiceNoteUrl('audio_recording_simulated.mp3');
    } else {
      setIsRecording(true);
      setVoiceNoteDuration(0);
      const interval = setInterval(() => {
        setVoiceNoteDuration(prev => {
          if (prev >= 10) {
            clearInterval(interval);
            setIsRecording(false);
            setVoiceNoteUrl('audio_recording_simulated.mp3');
            return 10;
          }
          return prev + 1;
        });
      }, 500);
    }
  };

  // Capture mock photo
  const simulatePhotoCapture = () => {
    const urls = [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=300", // retail outlet store
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=300", // boutique racks
      "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&q=80&w=300"  // storefront
    ];
    const rand = urls[Math.floor(Math.random() * urls.length)];
    setVisitPhoto(rand);
  };

  // Handle Check-out
  const handleCheckOut = () => {
    if (!activeVisit) return;
    
    const updatedVisit: Visit = {
      ...activeVisit,
      check_out_time: new Date().toISOString(),
      check_out_lat: simulatedLat,
      check_out_lng: simulatedLng,
      notes: visitNotes,
      photo_url: visitPhoto || undefined,
      voice_note_url: voiceNoteUrl || undefined
    };

    db.updateVisit(updatedVisit);
    setActiveVisit(null);
    setRadiusWarning(false);
    setActiveScreen('home');
  };

  // Add Item to cart
  const addToCart = (product: Product) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx].quantity += 1;
        return updated;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  // Adjust cart item quantity
  const updateCartQty = (prodId: string, val: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === prodId) {
          const newQty = Math.max(1, item.quantity + val);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (prodId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== prodId));
  };

  // Submit Order
  const handleSubmitOrder = () => {
    if (!cartClientId || cart.length === 0) return;

    const items = cart.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.price,
      total_price: item.quantity * item.product.price
    }));

    db.addOrder({
      client_id: cartClientId,
      sales_rep_id: activeRepId
    }, items);

    // Reset cart
    setCart([]);
    setCartClientId('');
    setActiveScreen('home');
    alert(currentLang === 'ar' ? 'تم تقديم الطلب بنجاح!' : currentLang === 'fr' ? 'Commande soumise avec succès !' : 'Order submitted successfully!');
  };

  // Capture mock expense receipt
  const simulateExpenseReceipt = () => {
    const receipts = [
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=300", // invoice slip
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=300"  // coins/card bill
    ];
    setExpensePhoto(receipts[Math.floor(Math.random() * receipts.length)]);
  };

  // Submit Expense
  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expenseAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    db.addExpense({
      sales_rep_id: activeRepId,
      category: expenseCategory,
      amount: amountNum,
      expense_date: new Date().toISOString().split('T')[0],
      notes: expenseNotes,
      photo_url: expensePhoto || undefined
    });

    setExpenseAmount('');
    setExpenseNotes('');
    setExpensePhoto('');
    setActiveScreen('home');
    alert(currentLang === 'ar' ? 'تم إرسال المصروف بنجاح!' : currentLang === 'fr' ? 'Note de frais soumise !' : 'Expense logged successfully!');
  };

  // Automatic Daily Report compilation for selected rep
  const handleCompileEOD = () => {
    const today = new Date().toISOString().split('T')[0];
    const reports = db.getDailyReports();
    const existing = reports.find(r => r.sales_rep_id === activeRepId && r.report_date === today);
    
    if (existing) {
      alert(currentLang === 'ar' ? 'تقرير نهاية اليوم متوفر بالفعل!' : currentLang === 'fr' ? 'Le rapport EOD est déjà disponible !' : 'EOD Report is already available!');
      return;
    }

    // Creating report entry by triggering stats fetch
    db.addNotification(`Representative completed and locked EOD activities summary. Ready for review.`, 'reminder');
    alert(currentLang === 'ar' ? 'تم توليد تقرير نهاية اليوم بنجاح!' : currentLang === 'fr' ? 'Rapport EOD généré avec succès !' : 'EOD Activity summary locked and synced!');
  };

  const getRepVisitsCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return db.getVisits().filter(v => v.sales_rep_id === activeRepId && v.check_in_time.startsWith(today)).length;
  };

  const getRepOrdersSum = () => {
    const today = new Date().toISOString().split('T')[0];
    const repOrders = db.getOrders().filter(o => o.sales_rep_id === activeRepId && o.order_date.startsWith(today));
    return repOrders.reduce((sum, o) => sum + o.total_amount, 0);
  };

  const selectedRep = reps.find(r => r.id === activeRepId);
  const rtl = currentLang === 'ar';

  return (
    <div className={`simulator-panel ${isDark ? 'dark-theme' : ''}`} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      maxWidth: '480px',
      margin: '0 auto',
      width: '100%'
    }}>
      
      {/* Simulation Controls (Outside the Phone Frame) */}
      <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '15px', color: 'var(--text-muted)' }}>⚙️ SIMULATOR ADJUSTMENTS</h4>
        
        <div className="form-group" style={{ margin: 0 }}>
          <label>Select active Rep</label>
          <select 
            className="form-control" 
            value={activeRepId} 
            onChange={(e) => {
              setActiveRepId(e.target.value);
              setActiveScreen('home');
            }}
          >
            {reps.map(r => (
              <option key={r.id} value={r.id}>{r.full_name}</option>
            ))}
          </select>
        </div>

        {/* GPS location simulator slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
          <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ fontWeight: 600 }}>📍 Set Rep Geolocation</span>
            <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>
              {simulatedLat.toFixed(5)}, {simulatedLng.toFixed(5)}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontSize: '11px', width: '50px' }}>Latitude</label>
            <input 
              type="range" 
              min={selectedRep?.id === 'user-rep-02' ? 31.5 : 45.0} 
              max={selectedRep?.id === 'user-rep-02' ? 34.0 : 49.0} 
              step="0.0001" 
              style={{ flexGrow: 1 }}
              value={simulatedLat}
              onChange={(e) => updateRepLocation(parseFloat(e.target.value), simulatedLng)}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontSize: '11px', width: '50px' }}>Longitude</label>
            <input 
              type="range" 
              min={selectedRep?.id === 'user-rep-02' ? -8.5 : 2.0} 
              max={selectedRep?.id === 'user-rep-02' ? -7.0 : 5.0} 
              step="0.0001" 
              style={{ flexGrow: 1 }}
              value={simulatedLng}
              onChange={(e) => updateRepLocation(simulatedLat, parseFloat(e.target.value))}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', width: '100%' }}>Snap Rep Location to:</span>
            {clients.map(c => (
              <button 
                key={c.id} 
                className="btn btn-secondary" 
                style={{ padding: '4px 8px', fontSize: '10px' }}
                onClick={() => snapToClient(c)}
              >
                {c.company_name} ({c.city})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Phone Frame Chassis */}
      <div className="phone-frame" style={{
        background: '#1e293b',
        borderRadius: '38px',
        padding: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        border: '4px solid #475569',
        height: '660px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Speaker & Camera Notch */}
        <div style={{
          width: '120px',
          height: '20px',
          background: '#1e293b',
          borderRadius: '0 0 12px 12px',
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px'
        }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#475569' }}></div>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#475569' }}></div>
        </div>

        {/* Screen Area */}
        <div className="phone-screen" dir={rtl ? 'rtl' : 'ltr'} style={{
          background: isDark ? '#0b0f19' : '#f8fafc',
          color: isDark ? '#f8fafc' : '#0f172a',
          borderRadius: '28px',
          flexGrow: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '24px', // Space below notch
          position: 'relative',
          fontFamily: 'var(--font-sans)'
        }}>
          
          {/* Phone Status Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '4px 16px',
            fontSize: '11px',
            fontWeight: 600,
            color: isDark ? '#94a3b8' : '#64748b'
          }}>
            <span>09:41</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <span>📶</span>
              <span>5G</span>
              <span>🔋 99%</span>
            </div>
          </div>

          {/* App Header Inside Simulator */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isDark ? '#0f172a' : '#ffffff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img 
                src={selectedRep?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'} 
                alt="Rep Avatar" 
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700 }}>{selectedRep?.full_name}</div>
                <div style={{ fontSize: '9px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                  {t.systemRealtimeSync}
                </div>
              </div>
            </div>
            {activeVisit && (
              <span className="badge badge-pending" style={{ fontSize: '9px', padding: '2px 6px' }}>
                ⚠️ {t.checkedIn}
              </span>
            )}
          </div>

          {/* Screen Content Wrapper */}
          <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px' }}>
            
            {/* 1. HOME SCREEN */}
            {activeScreen === 'home' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="card" style={{ padding: '14px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: 'white', border: 'none' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>
                    {currentLang === 'ar' ? 'مرحباً، ' : currentLang === 'fr' ? 'Bonjour, ' : 'Welcome back, '} {selectedRep?.full_name.split(' ')[0]}!
                  </h3>
                  <p style={{ fontSize: '11px', opacity: 0.9 }}>{t.todaySummary}</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '8px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '9px', textTransform: 'uppercase' }}>{t.clientsVisited}</div>
                      <div style={{ fontSize: '18px', fontWeight: 700 }}>{getRepVisitsCount()}</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.15)', padding: '8px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '9px', textTransform: 'uppercase' }}>{t.totalAmount}</div>
                      <div style={{ fontSize: '18px', fontWeight: 700 }}>${getRepOrdersSum().toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                {activeVisit ? (
                  <div className="card" style={{ padding: '14px', borderLeft: '4px solid var(--warning)' }}>
                    <h4 style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={16} className="text-warning" />
                      {t.checkedIn} : {clients.find(c => c.id === activeVisit.client_id)?.company_name}
                    </h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      GPS: {activeVisit.check_in_lat.toFixed(4)}, {activeVisit.check_in_lng.toFixed(4)}
                    </p>
                    {radiusWarning && (
                      <div style={{ background: '#fef3c7', color: '#b45309', padding: '6px', borderRadius: '6px', fontSize: '9px', marginTop: '6px' }}>
                        ⚠️ {t.outsideRadiusWarning}
                      </div>
                    )}
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%', marginTop: '10px', padding: '8px', fontSize: '12px' }}
                      onClick={() => setActiveScreen('clients')}
                    >
                      ✏️ {t.recordVisit}
                    </button>
                  </div>
                ) : (
                  <div className="card" style={{ padding: '16px', textAlign: 'center', cursor: 'pointer' }} onClick={() => setActiveScreen('clients')}>
                    <MapPin size={32} style={{ color: 'var(--primary)', margin: '0 auto 8px' }} />
                    <h4 style={{ fontSize: '14px' }}>{currentLang === 'ar' ? 'ابدأ زيارة جديدة' : currentLang === 'fr' ? 'Démarrer une Visite' : 'Start a New Client Visit'}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{currentLang === 'ar' ? 'سجل موقعك الميداني وابدأ العمل' : currentLang === 'fr' ? 'Enregistrez votre présence chez le client' : 'Log GPS check-in to begin order intake'}</p>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button className="btn btn-secondary" style={{ padding: '12px 8px', flexDirection: 'column', height: '70px', borderRadius: '12px' }} onClick={() => setActiveScreen('catalog')}>
                    <ShoppingCart size={18} />
                    <span style={{ fontSize: '10px', marginTop: '4px' }}>{t.catalog}</span>
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '12px 8px', flexDirection: 'column', height: '70px', borderRadius: '12px' }} onClick={() => setActiveScreen('expenses')}>
                    <DollarSign size={18} />
                    <span style={{ fontSize: '10px', marginTop: '4px' }}>{t.expenses}</span>
                  </button>
                </div>

                <button 
                  className="btn btn-success" 
                  style={{ width: '100%', padding: '10px', fontSize: '12px', display: 'flex', gap: '8px' }}
                  onClick={handleCompileEOD}
                >
                  📊 {t.generateEodReport}
                </button>
              </div>
            )}

            {/* 2. CLIENT CHECK-IN SCREEN */}
            {activeScreen === 'clients' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>👥 {t.clients}</h4>
                
                {activeVisit ? (
                  // Checking Out form details
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ fontSize: '13px' }}>
                      <strong>Client:</strong> {clients.find(c => c.id === activeVisit.client_id)?.company_name}
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label>{t.visitNotes}</label>
                      <textarea 
                        className="form-control" 
                        rows={3} 
                        placeholder="..." 
                        value={visitNotes}
                        onChange={(e) => setVisitNotes(e.target.value)}
                      />
                    </div>

                    {/* Receipt Upload Mock */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ flexGrow: 1, padding: '8px', fontSize: '11px', gap: '4px' }}
                        onClick={simulatePhotoCapture}
                      >
                        <Camera size={14} /> {t.photosUpload}
                      </button>
                      
                      {visitPhoto && (
                        <img 
                          src={visitPhoto} 
                          alt="preview" 
                          style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }}
                        />
                      )}
                    </div>

                    {/* Voice Memo Mock */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>🎤 {t.voiceNotes}</label>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button 
                          type="button" 
                          className={`btn ${isRecording ? 'btn-danger' : 'btn-secondary'}`}
                          style={{ padding: '8px', fontSize: '11px', gap: '4px' }}
                          onClick={toggleRecording}
                        >
                          <Mic size={14} /> 
                          {isRecording ? `Recording... (${voiceNoteDuration}s)` : voiceNoteUrl ? 'Redo Voice Note' : 'Record Memo'}
                        </button>
                        {voiceNoteUrl && <Volume2 size={16} style={{ color: 'var(--primary)' }} />}
                      </div>
                    </div>

                    <button 
                      className="btn btn-danger" 
                      style={{ width: '100%', padding: '10px', marginTop: '10px', fontSize: '12px' }}
                      onClick={handleCheckOut}
                    >
                      🚪 {t.checkOut}
                    </button>
                  </div>
                ) : (
                  // Select client to Check-In
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {clients.map(c => {
                      const dist = calculateDistance(simulatedLat, simulatedLng, c.latitude, c.longitude);
                      const inRange = dist <= 200;
                      return (
                        <div key={c.id} className="card" style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ flexGrow: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: 700 }}>{c.company_name}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{c.address}, {c.city}</div>
                            <div style={{ fontSize: '9px', marginTop: '4px', color: inRange ? 'var(--success)' : 'var(--danger)' }}>
                              📍 {dist > 1000 ? `${(dist/1000).toFixed(1)} km` : `${Math.round(dist)} m`} away
                            </div>
                          </div>
                          
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '6px 10px', fontSize: '10px' }}
                            onClick={() => handleCheckIn(c)}
                          >
                            🚪 In
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 3. PRODUCT CATALOG SCREEN */}
            {activeScreen === 'catalog' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <h4 style={{ fontSize: '14px' }}>👕 {t.catalog}</h4>
                  <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '10px' }} onClick={() => setActiveScreen('orders')}>
                    🛒 ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {products.map(p => (
                    <div key={p.id} className="card" style={{ padding: '8px', display: 'flex', gap: '10px' }}>
                      <img 
                        src={p.photo_url} 
                        alt={p.reference} 
                        style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontSize: '11px', fontWeight: 700 }}>{p.description}</div>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Ref: {p.reference}</div>
                        <div style={{ fontSize: '11px', fontWeight: 800, marginTop: '2px', color: 'var(--primary)' }}>${p.price.toFixed(2)}</div>
                        <div style={{ fontSize: '9px', color: p.stock_quantity > 0 ? 'var(--success)' : 'var(--danger)' }}>
                          Stock: {p.stock_quantity}
                        </div>
                      </div>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '4px 6px', height: '24px', fontSize: '10px', borderRadius: '4px', alignSelf: 'center' }}
                        onClick={() => addToCart(p)}
                        disabled={p.stock_quantity <= 0}
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. ORDERS CART SCREEN */}
            {activeScreen === 'orders' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>🛒 {t.createOrder}</h4>
                
                <div className="form-group">
                  <label>Select Client</label>
                  <select 
                    className="form-control" 
                    value={cartClientId} 
                    onChange={(e) => setCartClientId(e.target.value)}
                  >
                    <option value="">-- Choose Client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.company_name}</option>
                    ))}
                  </select>
                </div>

                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Cart is empty. Select products from catalog.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {cart.map(item => (
                      <div key={item.product.id} className="card" style={{ padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flexGrow: 1 }}>
                          <div style={{ fontSize: '11px', fontWeight: 700 }}>{item.product.description}</div>
                          <div style={{ fontSize: '10px', color: 'var(--primary)' }}>${item.product.price.toFixed(2)}</div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '2px 6px', fontSize: '10px' }}
                            onClick={() => updateCartQty(item.product.id, -1)}
                          >
                            -
                          </button>
                          <span style={{ fontSize: '12px', fontWeight: 600 }}>{item.quantity}</span>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '2px 6px', fontSize: '10px' }}
                            onClick={() => updateCartQty(item.product.id, 1)}
                          >
                            +
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '4px', fontSize: '8px', borderRadius: '4px' }}
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    ))}

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
                      <span>{t.totalAmount}:</span>
                      <span>
                        ${cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}
                      </span>
                    </div>

                    <button 
                      className="btn btn-success" 
                      style={{ width: '100%', padding: '10px', fontSize: '12px', marginTop: '8px' }}
                      disabled={!cartClientId}
                      onClick={handleSubmitOrder}
                    >
                      📝 {t.submitOrder}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 5. EXPENSE LOGGER SCREEN */}
            {activeScreen === 'expenses' && (
              <form onSubmit={handleSubmitExpense} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontSize: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>💰 {t.submitExpense}</h4>

                <div className="form-group">
                  <label>{t.expenseCategory}</label>
                  <select 
                    className="form-control"
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as any)}
                  >
                    <option value="Diesel">{t.diesel}</option>
                    <option value="Highway tolls">{t.tolls}</option>
                    <option value="Hotel">{t.hotel}</option>
                    <option value="Meals">{t.meals}</option>
                    <option value="Other expenses">{t.otherExpenses}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t.amount} ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-control" 
                    placeholder="0.00" 
                    required 
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>{t.notes}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="..." 
                    value={expenseNotes}
                    onChange={(e) => setExpenseNotes(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', margin: '6px 0' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ flexGrow: 1, padding: '8px', fontSize: '11px', gap: '4px' }}
                    onClick={simulateExpenseReceipt}
                  >
                    <Camera size={14} /> {t.receiptPhoto}
                  </button>
                  {expensePhoto && (
                    <img 
                      src={expensePhoto} 
                      alt="preview" 
                      style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }}
                    />
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '10px', fontSize: '12px', marginTop: '10px' }}
                >
                  🚀 {t.submitExpense}
                </button>
              </form>
            )}

          </div>

          {/* Phone Navigation Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            borderTop: '1px solid var(--border)',
            background: isDark ? '#0f172a' : '#ffffff',
            padding: '6px 0',
            zIndex: 10
          }}>
            <button 
              onClick={() => setActiveScreen('home')} 
              style={{
                background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', 
                color: activeScreen === 'home' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', gap: '2px'
              }}
            >
              <RefreshCw size={14} />
              <span style={{ fontSize: '8px' }}>Home</span>
            </button>
            
            <button 
              onClick={() => setActiveScreen('clients')} 
              style={{
                background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', 
                color: activeScreen === 'clients' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', gap: '2px'
              }}
            >
              <MapPin size={14} />
              <span style={{ fontSize: '8px' }}>Visits</span>
            </button>

            <button 
              onClick={() => setActiveScreen('catalog')} 
              style={{
                background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', 
                color: activeScreen === 'catalog' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', gap: '2px'
              }}
            >
              <ShoppingCart size={14} />
              <span style={{ fontSize: '8px' }}>Catalog</span>
            </button>

            <button 
              onClick={() => setActiveScreen('expenses')} 
              style={{
                background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', 
                color: activeScreen === 'expenses' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', gap: '2px'
              }}
            >
              <DollarSign size={14} />
              <span style={{ fontSize: '8px' }}>Expenses</span>
            </button>

            <button 
              onClick={() => setActiveScreen('orders')} 
              style={{
                background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', 
                color: activeScreen === 'orders' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', gap: '2px'
              }}
            >
              <FileText size={14} />
              <span style={{ fontSize: '8px' }}>Cart</span>
            </button>
          </div>

          {/* iPhone Home Indicator bar */}
          <div style={{
            height: '4px',
            width: '100px',
            background: isDark ? '#475569' : '#cbd5e1',
            borderRadius: '2px',
            margin: '6px auto',
            flexShrink: 0
          }}></div>

        </div>
      </div>
    </div>
  );
};
