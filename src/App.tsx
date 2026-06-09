import React, { useState, useEffect, useRef } from 'react';
import { db, Client, Product, Order, Expense, Visit, User, Notification, DailyReport } from './mockData';
import { translations, isRtl } from './translations';
import { MobileSimulator } from './components/MobileSimulator';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  LayoutDashboard, Users, ShoppingBag, FileSpreadsheet, 
  DollarSign, FileText, Map, AlertCircle, Bell, Moon, Sun, 
  Globe, UserCheck, Plus, Check, X, Eye, FileDown, Navigation, RefreshCcw 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import L from 'leaflet';

export default function App() {
  const [lang, setLang] = useState<'en' | 'fr' | 'ar'>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'catalog' | 'orders' | 'expenses' | 'reports' | 'tracking'>('dashboard');
  const [showSimulator, setShowSimulator] = useState<boolean>(true);
  
  // Database entities
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reps, setReps] = useState<User[]>([]);
  
  // Notification menu toggle
  const [showNotifMenu, setShowNotifMenu] = useState<boolean>(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);

  // Form states
  const [newClient, setNewClient] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    address: '',
    city: '',
    latitude: 48.8566,
    longitude: 2.3522,
    notes: ''
  });
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<Client | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [selectedReportDetails, setSelectedReportDetails] = useState<DailyReport | null>(null);

  // Map references
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const [selectedRepForTracking, setSelectedRepForTracking] = useState<string>('all');

  // Multi-language translation helper
  const t = translations[lang];

  // Apply language direction & theme classes to DOM
  useEffect(() => {
    document.documentElement.dir = isRtl(lang) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const bodyClass = document.body.classList;
    if (theme === 'dark') {
      bodyClass.add('dark-theme');
    } else {
      bodyClass.remove('dark-theme');
    }
  }, [theme]);

  // Load database state
  const syncDatabase = () => {
    setClients(db.getClients());
    setProducts(db.getProducts());
    setOrders(db.getOrders());
    setExpenses(db.getExpenses());
    setVisits(db.getVisits());
    setReports(db.getDailyReports());
    
    const allNotifs = db.getNotifications();
    setNotifications(allNotifs);
    setUnreadNotifCount(allNotifs.filter(n => !n.read).length);

    setReps(db.getUsers().filter(u => u.role === 'sales_rep'));
  };

  useEffect(() => {
    syncDatabase();
    // React to local database events
    const handleUpdate = () => syncDatabase();
    window.addEventListener('mock_db_update', handleUpdate);
    return () => window.removeEventListener('mock_db_update', handleUpdate);
  }, []);

  // Handle Mark Notifications Read
  const handleReadNotifications = () => {
    db.markNotificationsRead();
    setShowNotifMenu(false);
  };

  // Add Client Form Submit
  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.company_name || !newClient.contact_person || !newClient.phone || !newClient.address || !newClient.city) {
      return;
    }
    db.addClient({
      company_name: newClient.company_name,
      contact_person: newClient.contact_person,
      phone: newClient.phone,
      address: newClient.address,
      latitude: Number(newClient.latitude),
      longitude: Number(newClient.longitude),
      city: newClient.city,
      notes: newClient.notes
    });

    // Reset Form
    setNewClient({
      company_name: '',
      contact_person: '',
      phone: '',
      address: '',
      city: '',
      latitude: 48.8566,
      longitude: 2.3522,
      notes: ''
    });
    alert(lang === 'ar' ? 'تم إضافة العميل بنجاح!' : lang === 'fr' ? 'Client ajouté avec succès !' : 'Client registered successfully!');
  };

  // Approve / Reject Expense
  const handleExpenseAction = (expenseId: string, action: 'Approved' | 'Rejected') => {
    db.updateExpenseStatus(expenseId, action, 'user-mgr-01');
  };

  // Restock Catalog Product stock
  const handleRestockProduct = (productId: string, quantity: number) => {
    db.updateProductStock(productId, -quantity); // subtract negative to add stock
  };

  // Leaflet Map Initialization
  useEffect(() => {
    if (activeTab !== 'tracking') {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersGroupRef.current = null;
      }
      return;
    }

    const mapElement = document.getElementById('tracking-map');
    if (!mapElement || mapRef.current) return;

    // Default center near Paris / central France
    const initialMap = L.map('tracking-map').setView([45.0, 2.0], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(initialMap);

    const markersGroup = L.layerGroup().addTo(initialMap);
    mapRef.current = initialMap;
    markersGroupRef.current = markersGroup;

    // Force style refresh for dynamic rendering
    setTimeout(() => {
      initialMap.invalidateSize();
    }, 200);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, [activeTab]);

  // Update Map Markers & Paths
  useEffect(() => {
    if (activeTab !== 'tracking' || !mapRef.current || !markersGroupRef.current) return;

    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    // Custom Map Icons
    const clientIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #6366f1; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3)"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const repIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(239, 68, 68, 0.6); animation: pulse 1.5s infinite"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const bounds: L.LatLngTuple[] = [];

    // 1. Draw Clients
    clients.forEach(c => {
      const marker = L.marker([c.latitude, c.longitude], { icon: clientIcon })
        .bindPopup(`<strong>${c.company_name}</strong><br/>${c.address}, ${c.city}`)
        .addTo(markersGroup);
      bounds.push([c.latitude, c.longitude]);
    });

    // 2. Draw reps & their paths
    const filteredReps = selectedRepForTracking === 'all' 
      ? reps 
      : reps.filter(r => r.id === selectedRepForTracking);

    filteredReps.forEach(rep => {
      // Rep Current Location
      if (rep.current_lat && rep.current_lng) {
        L.marker([rep.current_lat, rep.current_lng], { icon: repIcon })
          .bindPopup(`<strong>${rep.full_name}</strong><br/>Live location tracking`)
          .addTo(markersGroup);
        bounds.push([rep.current_lat, rep.current_lng]);

        // Draw path connecting visited clients for the day
        const repVisits = visits
          .filter(v => v.sales_rep_id === rep.id)
          .sort((a, b) => a.check_in_time.localeCompare(b.check_in_time));

        if (repVisits.length > 0) {
          const latlngs: L.LatLngTuple[] = [];
          
          repVisits.forEach(v => {
            latlngs.push([v.check_in_lat, v.check_in_lng]);
          });
          // Add current live position to end of path
          latlngs.push([rep.current_lat, rep.current_lng]);

          // Draw dotted polyline
          L.polyline(latlngs, {
            color: rep.id === 'user-rep-01' ? '#3b82f6' : '#10b981',
            dashArray: '5, 10',
            weight: 3,
            opacity: 0.8
          }).addTo(markersGroup);
        }
      }
    });

    // Zoom map to fit all markings
    if (bounds.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [activeTab, clients, reps, visits, selectedRepForTracking]);

  // Excel Exporter
  const exportExcelReport = (repReport: DailyReport) => {
    const repObj = reps.find(r => r.id === repReport.sales_rep_id);
    
    // Sheet 1: General Info
    const generalData = [
      { Metric: "Date", Value: repReport.report_date },
      { Metric: "Representative", Value: repObj?.full_name || "Unknown" },
      { Metric: "Clients Visited", Value: repReport.visited_clients_count },
      { Metric: "Orders Taken", Value: repReport.total_orders_count },
      { Metric: "Total Sales Amount", Value: `$${Number(repReport.total_sales_amount).toFixed(2)}` },
      { Metric: "Total Expenses Filed", Value: `$${Number(repReport.total_expenses).toFixed(2)}` },
      { Metric: "Daily Mileage", Value: `${repReport.report_data.mileage} km` }
    ];

    // Sheet 2: Visits details
    const visitsData = repReport.report_data.visits.map(v => {
      const c = clients.find(cl => cl.id === v.client_id);
      return {
        "Company Name": c?.company_name || "Unknown",
        "Check In Time": new Date(v.check_in_time).toLocaleTimeString(),
        "Check Out Time": v.check_out_time ? new Date(v.check_out_time).toLocaleTimeString() : "N/A",
        "Check In GPS": `${v.check_in_lat.toFixed(4)}, ${v.check_in_lng.toFixed(4)}`,
        "Notes": v.notes || ""
      };
    });

    // Sheet 3: Orders details
    const ordersData = repReport.report_data.orders.map(o => {
      const c = clients.find(cl => cl.id === o.client_id);
      return {
        "Order ID": o.id,
        "Client": c?.company_name || "Unknown",
        "Amount": o.total_amount,
        "Status": o.status
      };
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    const wsGen = XLSX.utils.json_to_sheet(generalData);
    XLSX.utils.book_append_sheet(wb, wsGen, "General Summary");

    if (visitsData.length > 0) {
      const wsVis = XLSX.utils.json_to_sheet(visitsData);
      XLSX.utils.book_append_sheet(wb, wsVis, "Visits History");
    }

    if (ordersData.length > 0) {
      const wsOrd = XLSX.utils.json_to_sheet(ordersData);
      XLSX.utils.book_append_sheet(wb, wsOrd, "Orders List");
    }

    XLSX.writeFile(wb, `EOD_Report_${repObj?.full_name.replace(/\s+/g, '_')}_${repReport.report_date}.xlsx`);
  };

  // PDF Exporter
  const exportPdfReport = (repReport: DailyReport) => {
    const repObj = reps.find(r => r.id === repReport.sales_rep_id);
    const doc = new jsPDF();

    // Styling
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text("SARTORIAL REP - SALES SUMMARY SHEET", 14, 20);
    
    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 26);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 30, 196, 30);

    // Metadata Table
    const metaHead = [['Metric', 'Detail']];
    const metaBody = [
      ['Date', repReport.report_date],
      ['Representative', repObj?.full_name || 'N/A'],
      ['Clients Visited', String(repReport.visited_clients_count)],
      ['Orders Filed', String(repReport.total_orders_count)],
      ['Total Sales Volume', `$${Number(repReport.total_sales_amount).toFixed(2)}`],
      ['Total Expenses logged', `$${Number(repReport.total_expenses).toFixed(2)}`],
      ['Total Travel Distance', `${repReport.report_data.mileage} km`]
    ];

    (doc as any).autoTable({
      startY: 35,
      head: metaHead,
      body: metaBody,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    // Visits Sub-table
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text("Daily Field Visits log", 14, (doc as any).lastAutoTable.finalY + 15);

    const visitsHead = [['Client', 'Check-In', 'Check-Out', 'Visit Notes']];
    const visitsBody = repReport.report_data.visits.map(v => {
      const c = clients.find(cl => cl.id === v.client_id);
      return [
        c?.company_name || 'Unknown',
        new Date(v.check_in_time).toLocaleTimeString(),
        v.check_out_time ? new Date(v.check_out_time).toLocaleTimeString() : 'N/A',
        v.notes || ''
      ];
    });

    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: visitsHead,
      body: visitsBody,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] }
    });

    // Save
    doc.save(`EOD_Report_${repObj?.full_name.replace(/\s+/g, '_')}_${repReport.report_date}.pdf`);
  };

  // Compile Chart Data
  const getProductChartData = () => {
    const counts: Record<string, number> = {};
    orders.forEach(o => {
      // Mock / actual items matching
      const items = o.items || [];
      items.forEach(it => {
        const prod = products.find(p => p.id === it.product_id);
        if (prod) {
          counts[prod.description] = (counts[prod.description] || 0) + (it.unit_price * it.quantity);
        }
      });
    });

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  };

  const getCityChartData = () => {
    const counts: Record<string, number> = {};
    orders.forEach(o => {
      const cl = clients.find(c => c.id === o.client_id);
      if (cl) {
        counts[cl.city] = (counts[cl.city] || 0) + o.total_amount;
      }
    });

    return Object.keys(counts).map(key => ({
      city: key,
      sales: counts[key]
    }));
  };

  const getMonthlySalesData = () => {
    // Group orders of the last 6 months
    return [
      { month: 'Jan', sales: 12000, visits: 45 },
      { month: 'Feb', sales: 18500, visits: 55 },
      { month: 'Mar', sales: 15400, visits: 60 },
      { month: 'Apr', sales: 22000, visits: 72 },
      { month: 'May', sales: 26800, visits: 85 },
      { month: 'Jun', sales: orders.reduce((s,o)=>s+o.total_amount,0) + 14000, visits: visits.length + 65 }
    ];
  };

  // Total Summaries
  const totalSalesVolume = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalExpensesLogged = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const pendingExpenses = expenses.filter(e => e.status === 'Pending');

  // Chart Color Palette
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#14b8a6'];

  return (
    <div className="app-container">
      
      {/* 1. LEFT SIDEBAR PANEL */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span style={{ fontSize: '28px' }}>👔</span>
          <h2>Sartorial Rep</h2>
        </div>

        <ul className="sidebar-menu">
          <li className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('dashboard')}>
              <LayoutDashboard size={18} />
              <span>{t.dashboard}</span>
            </button>
          </li>
          
          <li className={`sidebar-item ${activeTab === 'clients' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('clients')}>
              <Users size={18} />
              <span>{t.clients}</span>
            </button>
          </li>

          <li className={`sidebar-item ${activeTab === 'catalog' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('catalog')}>
              <ShoppingBag size={18} />
              <span>{t.catalog}</span>
            </button>
          </li>

          <li className={`sidebar-item ${activeTab === 'orders' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('orders')}>
              <FileSpreadsheet size={18} />
              <span>{t.orders}</span>
            </button>
          </li>

          <li className={`sidebar-item ${activeTab === 'expenses' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('expenses')}>
              <DollarSign size={18} />
              <span>{t.expenses}</span>
              {pendingExpenses.length > 0 && (
                <span className="badge badge-pending" style={{ marginLeft: 'auto', fontSize: '10px', padding: '2px 6px' }}>
                  {pendingExpenses.length}
                </span>
              )}
            </button>
          </li>

          <li className={`sidebar-item ${activeTab === 'reports' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('reports')}>
              <FileText size={18} />
              <span>{t.reports}</span>
            </button>
          </li>

          <li className={`sidebar-item ${activeTab === 'tracking' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('tracking')}>
              <Map size={18} />
              <span>{t.tracking}</span>
            </button>
          </li>

          {/* Simulator Toggle Button inside Sidebar */}
          <li className="sidebar-item" style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
            <button 
              onClick={() => setShowSimulator(prev => !prev)} 
              style={{ color: showSimulator ? 'var(--primary)' : 'var(--text-sidebar)' }}
            >
              <UserCheck size={18} />
              <span>{showSimulator ? "Hide Simulator" : "Show Simulator"}</span>
            </button>
          </li>
        </ul>

        {/* Sidebar Footer Controls */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          
          {/* Language Toggle */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Globe size={16} />
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as any)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: 'none',
                padding: '6px',
                borderRadius: '4px',
                fontSize: '13px',
                flexGrow: 1,
                outline: 'none'
              }}
            >
              <option value="en" style={{ color: '#000' }}>English (EN)</option>
              <option value="fr" style={{ color: '#000' }}>Français (FR)</option>
              <option value="ar" style={{ color: '#000' }}>العربية (AR)</option>
            </select>
          </div>

          {/* Theme Selector */}
          <button 
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            className="btn btn-secondary"
            style={{ 
              width: '100%', 
              background: 'rgba(255,255,255,0.08)', 
              border: 'none', 
              color: '#fff',
              fontSize: '13px',
              padding: '8px'
            }}
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            <span style={{ marginLeft: '8px' }}>
              {theme === 'light' ? t.darkMode : t.lightMode}
            </span>
          </button>
        </div>
      </aside>

      {/* 2. DYNAMIC WORKSPACE CONTENT PANEL */}
      <main className="main-content">
        
        {/* Header bar */}
        <header className="top-header">
          <div className="header-title">
            <h1 style={{ textTransform: 'capitalize' }}>
              {activeTab === 'dashboard' ? t.dashboard : 
               activeTab === 'clients' ? t.clients : 
               activeTab === 'catalog' ? t.catalog : 
               activeTab === 'orders' ? t.orders : 
               activeTab === 'expenses' ? t.expenses : 
               activeTab === 'reports' ? t.reports : t.tracking}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {t.managerView} &bull; {t.systemRealtimeSync}
            </p>
          </div>

          <div className="header-controls">
            
            {/* Realtime Notification Bell Menu */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifMenu(prev => !prev)}
                className="btn btn-secondary" 
                style={{ padding: '8px 12px', position: 'relative' }}
              >
                <Bell size={18} />
                {unreadNotifCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-4px', background: 'var(--danger)',
                    color: 'white', width: '18px', height: '18px', borderRadius: '50%',
                    fontSize: '10px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center'
                  }}>
                    {unreadNotifCount}
                  </span>
                )}
              </button>
              
              {showNotifMenu && (
                <div className="card" style={{
                  position: 'absolute', right: 0, top: '45px', width: '300px', zIndex: 100,
                  maxHeight: '350px', overflowY: 'auto', padding: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '14px' }}>Notifications</strong>
                    <button 
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '11px' }}
                      onClick={handleReadNotifications}
                    >
                      Mark read
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '16px 0', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {t.noData}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {notifications.map(n => (
                        <div 
                          key={n.id} 
                          style={{
                            padding: '8px', borderRadius: '6px', fontSize: '11px',
                            background: n.read ? 'transparent' : 'var(--primary-glow)',
                            borderBottom: '1px solid var(--border)'
                          }}
                        >
                          <p style={{ color: 'var(--text-main)' }}>{n.message}</p>
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                            {new Date(n.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" 
                alt="Manager Profile" 
                style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ fontSize: '13px', display: 'none', flexDirection: 'column', mdShow: 'flex' }}>
                <span style={{ fontWeight: 700 }}>Emily Vance</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Administrator</span>
              </div>
            </div>

          </div>
        </header>

        {/* Tab Page Contents */}
        <div className="page-container" style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* Main Web Dashboard Tab Content */}
          <div style={{ flexGrow: 3, flexBasis: '600px', minWidth: 0 }}>
            
            {/* A. DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
              <div>
                {/* Stats Summary Cards Grid */}
                <div className="stats-grid">
                  <div className="card stat-card">
                    <div className="stat-header">
                      <span className="stat-title">{t.dailySales}</span>
                      <span className="stat-icon" style={{ backgroundColor: 'var(--success-glow)', color: 'var(--success)' }}>💰</span>
                    </div>
                    <span className="stat-value">${totalSalesVolume.toFixed(2)}</span>
                  </div>

                  <div className="card stat-card">
                    <div className="stat-header">
                      <span className="stat-title">{t.clientsVisited}</span>
                      <span className="stat-icon" style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' }}>🚪</span>
                    </div>
                    <span className="stat-value">{visits.length}</span>
                  </div>

                  <div className="card stat-card">
                    <div className="stat-header">
                      <span className="stat-title">{t.totalOrders}</span>
                      <span className="stat-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent)' }}>🛒</span>
                    </div>
                    <span className="stat-value">{orders.length}</span>
                  </div>

                  <div className="card stat-card">
                    <div className="stat-header">
                      <span className="stat-title">{t.totalExpenses}</span>
                      <span className="stat-icon" style={{ backgroundColor: 'var(--warning-glow)', color: 'var(--warning)' }}>💸</span>
                    </div>
                    <span className="stat-value">${totalExpensesLogged.toFixed(2)}</span>
                  </div>
                </div>

                {/* Analytical Charts panel */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                  
                  {/* Monthly bar graph */}
                  <div className="card">
                    <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>📈 {t.performanceCharts} ({t.monthlyStats})</h3>
                    <div style={{ width: '100%', height: '240px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getMonthlySalesData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="sales" stroke="var(--primary)" activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* City breakdown */}
                  <div className="card">
                    <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>🏙️ {t.salesByCity}</h3>
                    <div style={{ width: '100%', height: '240px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getCityChartData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="city" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="sales" fill="var(--accent)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Sales rep list & live activity updates */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                  
                  {/* Representatives status grid */}
                  <div className="card">
                    <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>👥 {t.activeReps}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {reps.map(rep => {
                        const repVisits = visits.filter(v => v.sales_rep_id === rep.id);
                        const repOrders = orders.filter(o => o.sales_rep_id === rep.id);
                        const salesTot = repOrders.reduce((s,o)=>s+o.total_amount, 0);

                        return (
                          <div key={rep.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img src={rep.avatar_url} alt="rep" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                              <div>
                                <span style={{ fontWeight: 700, fontSize: '14px' }}>{rep.full_name}</span>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                  GPS: {rep.current_lat?.toFixed(3)}, {rep.current_lng?.toFixed(3)}
                                </div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>${salesTot.toFixed(2)}</span>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                {repVisits.length} visits &bull; {repOrders.length} orders
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Feed log */}
                  <div className="card">
                    <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>⏱️ {t.recentActivity}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
                      {visits.slice(0, 10).map(v => {
                        const rep = reps.find(r => r.id === v.sales_rep_id);
                        const client = clients.find(c => c.id === v.client_id);
                        return (
                          <div key={v.id} style={{ fontSize: '12px', borderLeft: '3px solid var(--primary)', paddingLeft: '8px', paddingBottom: '4px' }}>
                            <p><strong>{rep?.full_name}</strong> checked in to <strong>{client?.company_name}</strong></p>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                              {new Date(v.check_in_time).toLocaleTimeString()} &bull; {v.notes || 'No entry notes'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* B. CLIENTS TAB */}
            {activeTab === 'clients' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Client Addition Form */}
                <div className="card">
                  <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>📝 {t.addNewClient}</h3>
                  <form onSubmit={handleAddClientSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div className="form-group">
                      <label>{t.companyName}</label>
                      <input 
                        type="text" className="form-control" required 
                        value={newClient.company_name} 
                        onChange={(e) => setNewClient({...newClient, company_name: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.contactPerson}</label>
                      <input 
                        type="text" className="form-control" required
                        value={newClient.contact_person}
                        onChange={(e) => setNewClient({...newClient, contact_person: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.phone}</label>
                      <input 
                        type="text" className="form-control" required
                        value={newClient.phone}
                        onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.city}</label>
                      <input 
                        type="text" className="form-control" required
                        value={newClient.city}
                        onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.address}</label>
                      <input 
                        type="text" className="form-control" required
                        value={newClient.address}
                        onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.latitude} (GPS)</label>
                      <input 
                        type="number" step="0.000001" className="form-control" required
                        value={newClient.latitude}
                        onChange={(e) => setNewClient({...newClient, latitude: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.longitude} (GPS)</label>
                      <input 
                        type="number" step="0.000001" className="form-control" required
                        value={newClient.longitude}
                        onChange={(e) => setNewClient({...newClient, longitude: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t.notes}</label>
                      <input 
                        type="text" className="form-control"
                        value={newClient.notes}
                        onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                      />
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1', height: '45px' }}>
                      <Plus size={16} /> {t.saveClient}
                    </button>
                  </form>
                </div>

                {/* Clients Grid */}
                <div className="card">
                  <h3 style={{ fontSize: '16px' }}>👥 Clients Register</h3>
                  <div className="table-container">
                    <table className="table-raw">
                      <thead>
                        <tr>
                          <th>{t.companyName}</th>
                          <th>{t.contactPerson}</th>
                          <th>{t.phone}</th>
                          <th>{t.city}</th>
                          <th>GPS Coordinates</th>
                          <th>{t.actions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clients.map(c => (
                          <tr key={c.id}>
                            <td><strong>{c.company_name}</strong></td>
                            <td>{c.contact_person}</td>
                            <td>{c.phone}</td>
                            <td>{c.city}</td>
                            <td style={{ fontFamily: 'monospace' }}>{c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}</td>
                            <td>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                                onClick={() => setSelectedClientForHistory(c)}
                              >
                                <Eye size={12} /> {t.clientHistory}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Customer Visit history modal */}
                {selectedClientForHistory && (
                  <div className="card" style={{ borderLeft: '4px solid var(--primary)', marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '12px' }}>
                      <h3>📋 {selectedClientForHistory.company_name} - {t.clientHistory}</h3>
                      <button className="btn btn-secondary" style={{ padding: '4px' }} onClick={() => setSelectedClientForHistory(null)}>
                        <X size={16} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {visits.filter(v => v.client_id === selectedClientForHistory.id).length === 0 ? (
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t.noData}</p>
                      ) : (
                        visits.filter(v => v.client_id === selectedClientForHistory.id).map(v => {
                          const rep = reps.find(r => r.id === v.sales_rep_id);
                          return (
                            <div key={v.id} style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                                <strong>Rep: {rep?.full_name}</strong>
                                <span style={{ color: 'var(--text-muted)' }}>{new Date(v.check_in_time).toLocaleDateString()}</span>
                              </div>
                              <p style={{ fontSize: '13px' }}><strong>Notes:</strong> {v.notes || 'N/A'}</p>
                              
                              <div style={{ display: 'flex', gap: '10px', marginTop: '6px', alignItems: 'center' }}>
                                {v.photo_url && (
                                  <a href={v.photo_url} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--primary)', display: 'flex', gap: '4px' }}>
                                    🖼️ Image
                                  </a>
                                )}
                                {v.voice_note_url && (
                                  <span style={{ fontSize: '11px', color: 'var(--accent)', display: 'flex', gap: '4px' }}>
                                    🎤 Voice Note Attached
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* C. PRODUCT CATALOG TAB */}
            {activeTab === 'catalog' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="card">
                  <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>👕 Product Inventory</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    {products.map(p => (
                      <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
                        <img 
                          src={p.photo_url} 
                          alt={p.reference} 
                          style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <div>
                          <strong style={{ fontSize: '14px', display: 'block' }}>{p.description}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ref: {p.reference}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)' }}>${p.price.toFixed(2)}</span>
                          <span className={`badge ${p.stock_quantity > 0 ? 'badge-approved' : 'badge-rejected'}`} style={{ fontSize: '10px' }}>
                            Stock: {p.stock_quantity}
                          </span>
                        </div>

                        {/* Restock trigger */}
                        <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ flexGrow: 1, padding: '4px', fontSize: '11px' }}
                            onClick={() => handleRestockProduct(p.id, 50)}
                          >
                            +50 Restock
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* D. ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="card">
                <h3 style={{ fontSize: '16px' }}>🛒 Sales Orders Log</h3>
                <div className="table-container">
                  <table className="table-raw">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Client</th>
                        <th>Representative</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => {
                        const c = clients.find(cl => cl.id === o.client_id);
                        const r = reps.find(rep => rep.id === o.sales_rep_id);
                        return (
                          <tr key={o.id}>
                            <td><span style={{ fontFamily: 'monospace' }}>{o.id.substring(0, 8)}...</span></td>
                            <td><strong>{c?.company_name}</strong></td>
                            <td>{r?.full_name}</td>
                            <td>{new Date(o.order_date).toLocaleDateString()}</td>
                            <td><strong>${o.total_amount.toFixed(2)}</strong></td>
                            <td>
                              <span className={`badge badge-${o.status.toLowerCase()}`}>
                                {o.status}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                                onClick={() => setSelectedOrderDetails(o)}
                              >
                                View Items
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Order products details dialog */}
                {selectedOrderDetails && (
                  <div className="card" style={{ borderLeft: '4px solid var(--success)', marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '12px' }}>
                      <h3>📋 Order Items Details ({selectedOrderDetails.id.substring(0,8)})</h3>
                      <button className="btn btn-secondary" style={{ padding: '4px' }} onClick={() => setSelectedOrderDetails(null)}>
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(selectedOrderDetails.items || []).map((it, idx) => {
                        const prod = products.find(p => p.id === it.product_id);
                        return (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                            <div>
                              <strong>{prod?.description}</strong>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                Qty: {it.quantity} x ${it.unit_price}
                              </div>
                            </div>
                            <strong style={{ fontSize: '13px' }}>${(it.quantity * it.unit_price).toFixed(2)}</strong>
                          </div>
                        );
                      })}

                      {/* Confirm / Deliver Status updater */}
                      {selectedOrderDetails.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                          <button 
                            className="btn btn-success" 
                            style={{ flexGrow: 1 }}
                            onClick={() => {
                              db.updateOrderStatus(selectedOrderDetails.id, 'Confirmed');
                              setSelectedOrderDetails(null);
                            }}
                          >
                            Confirm Order
                          </button>
                          <button 
                            className="btn btn-danger"
                            style={{ flexGrow: 1 }}
                            onClick={() => {
                              db.updateOrderStatus(selectedOrderDetails.id, 'Delivered');
                              setSelectedOrderDetails(null);
                            }}
                          >
                            Mark Delivered
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* E. EXPENSES TAB */}
            {activeTab === 'expenses' && (
              <div className="card">
                <h3 style={{ fontSize: '16px' }}>💸 Expense Reimbursements</h3>
                <div className="table-container">
                  <table className="table-raw">
                    <thead>
                      <tr>
                        <th>Rep</th>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Receipt</th>
                        <th>Notes</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map(e => {
                        const r = reps.find(rep => rep.id === e.sales_rep_id);
                        return (
                          <tr key={e.id}>
                            <td>{r?.full_name}</td>
                            <td><strong>{e.category}</strong></td>
                            <td><strong>${e.amount.toFixed(2)}</strong></td>
                            <td>{e.expense_date}</td>
                            <td>
                              {e.photo_url ? (
                                <a href={e.photo_url} target="_blank" rel="noreferrer">
                                  <img 
                                    src={e.photo_url} 
                                    alt="receipt" 
                                    style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                                  />
                                </a>
                              ) : 'N/A'}
                            </td>
                            <td>{e.notes || ''}</td>
                            <td>
                              <span className={`badge badge-${e.status.toLowerCase()}`}>
                                {e.status}
                              </span>
                            </td>
                            <td>
                              {e.status === 'Pending' ? (
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button 
                                    className="btn btn-success" 
                                    style={{ padding: '4px 8px', fontSize: '10px' }}
                                    onClick={() => handleExpenseAction(e.id, 'Approved')}
                                  >
                                    <Check size={12} /> Approve
                                  </button>
                                  <button 
                                    className="btn btn-danger"
                                    style={{ padding: '4px 8px', fontSize: '10px' }}
                                    onClick={() => handleExpenseAction(e.id, 'Rejected')}
                                  >
                                    <X size={12} /> Reject
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Reviewed</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* F. REPORTS TAB */}
            {activeTab === 'reports' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="card">
                  <h3 style={{ fontSize: '16px' }}>📊 Representative Daily Summaries</h3>
                  <div className="table-container">
                    <table className="table-raw">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Representative</th>
                          <th>Clients Visited</th>
                          <th>Mileage</th>
                          <th>Total Sales</th>
                          <th>Total Expenses</th>
                          <th>Export</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.map(r => {
                          const repObj = reps.find(rep => rep.id === r.sales_rep_id);
                          return (
                            <tr key={r.id}>
                              <td><strong>{r.report_date}</strong></td>
                              <td>{repObj?.full_name}</td>
                              <td>{r.visited_clients_count}</td>
                              <td>{r.report_data.mileage} km</td>
                              <td><strong>${r.total_sales_amount.toFixed(2)}</strong></td>
                              <td>${r.total_expenses.toFixed(2)}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button 
                                    className="btn btn-secondary" 
                                    style={{ padding: '4px 8px', fontSize: '10px' }}
                                    onClick={() => exportExcelReport(r)}
                                  >
                                    XLSX
                                  </button>
                                  <button 
                                    className="btn btn-secondary"
                                    style={{ padding: '4px 8px', fontSize: '10px' }}
                                    onClick={() => exportPdfReport(r)}
                                  >
                                    PDF
                                  </button>
                                </div>
                              </td>
                              <td>
                                <button 
                                  className="btn btn-primary" 
                                  style={{ padding: '4px 8px', fontSize: '11px' }}
                                  onClick={() => setSelectedReportDetails(r)}
                                >
                                  Consult Realtime
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* EOD Report Consultation Screen */}
                {selectedReportDetails && (
                  <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '12px' }}>
                      <div>
                        <h3>📋 {t.eodSummaryTitle}</h3>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.managerRealtimeAccess}</span>
                      </div>
                      <button className="btn btn-secondary" style={{ padding: '4px' }} onClick={() => setSelectedReportDetails(null)}>
                        <X size={16} />
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                      <div className="card" style={{ padding: '12px' }}>
                        <strong>General stats:</strong>
                        <ul style={{ listStyle: 'none', padding: 0, marginTop: '6px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <li>Date: {selectedReportDetails.report_date}</li>
                          <li>Representative: {reps.find(rep => rep.id === selectedReportDetails.sales_rep_id)?.full_name}</li>
                          <li>Mileage covered: {selectedReportDetails.report_data.mileage} km</li>
                          <li>Total orders volume: ${selectedReportDetails.total_sales_amount.toFixed(2)}</li>
                          <li>Total travel expenses: ${selectedReportDetails.total_expenses.toFixed(2)}</li>
                        </ul>
                      </div>

                      <div className="card" style={{ padding: '12px' }}>
                        <strong>Visited clients coordinates path:</strong>
                        <ul style={{ listStyle: 'none', padding: 0, marginTop: '6px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {selectedReportDetails.report_data.visits.map((v, i) => {
                            const c = clients.find(cl => cl.id === v.client_id);
                            return (
                              <li key={i}>
                                {i+1}. {c?.company_name} ({v.check_in_lat.toFixed(4)}, {v.check_in_lng.toFixed(4)})
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>

                    <div className="card" style={{ padding: '12px' }}>
                      <strong>Visits logs notes:</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                        {selectedReportDetails.report_data.visits.map((v, idx) => {
                          const c = clients.find(cl => cl.id === v.client_id);
                          return (
                            <div key={idx} style={{ fontSize: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                              <strong>{c?.company_name}</strong> Check-In: {new Date(v.check_in_time).toLocaleTimeString()}
                              <p style={{ marginTop: '4px', fontStyle: 'italic' }}>Notes: {v.notes || 'None'}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* G. GPS TRACKING TAB */}
            {activeTab === 'tracking' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px' }}>🗺️ {t.liveLocations}</h3>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GPS path connections indicate rep routes</span>
                    </div>

                    {/* Filter rep track */}
                    <div className="form-group" style={{ margin: 0, minWidth: '180px' }}>
                      <select 
                        className="form-control"
                        value={selectedRepForTracking}
                        onChange={(e) => setSelectedRepForTracking(e.target.value)}
                      >
                        <option value="all">-- All Representatives --</option>
                        {reps.map(r => (
                          <option key={r.id} value={r.id}>{r.full_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Leaflet Mount point */}
                  <div id="tracking-map" className="map-container"></div>
                </div>

                {/* Travel distance logs */}
                <div className="card">
                  <h3 style={{ fontSize: '15px', marginBottom: '10px' }}>🚗 Route Details & Mileage</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {reps.map(rep => {
                      const todayStr = new Date().toISOString().split('T')[0];
                      const mileage = db.getMileageForRep(rep.id, todayStr);
                      return (
                        <div key={rep.id} className="card" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Navigation size={24} style={{ color: 'var(--primary)', transform: 'rotate(45deg)' }} />
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '13px' }}>{rep.full_name}</span>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              Today distance: <strong>{mileage} km</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* 3. RIGHT SIDEBAR - PORTABLE MOBILE SIMULATOR */}
          {showSimulator && (
            <div style={{ flexGrow: 1, flexBasis: '340px', minWidth: '320px' }}>
              <MobileSimulator currentLang={lang} isDark={theme === 'dark'} t={t} />
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
