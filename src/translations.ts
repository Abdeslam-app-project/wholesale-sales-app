export interface TranslationSchema {
  dashboard: string;
  clients: string;
  visits: string;
  catalog: string;
  orders: string;
  expenses: string;
  reports: string;
  tracking: string;
  simulator: string;
  
  // Dashboard
  dailySales: string;
  clientsVisited: string;
  totalOrders: string;
  totalExpenses: string;
  monthlyStats: string;
  performanceCharts: string;
  activeReps: string;
  recentActivity: string;
  todaySummary: string;
  salesByProduct: string;
  salesByCity: string;
  
  // Client Management
  addNewClient: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  address: string;
  latitude: string;
  longitude: string;
  city: string;
  notes: string;
  clientHistory: string;
  noClientsYet: string;
  saveClient: string;
  
  // Visit Tracking
  recordVisit: string;
  dateTime: string;
  checkIn: string;
  checkOut: string;
  checkedIn: string;
  checkedOut: string;
  visitNotes: string;
  photosUpload: string;
  voiceNotes: string;
  distanceTraveled: string;
  dailyMileage: string;
  locationVerified: string;
  outsideRadiusWarning: string;
  
  // Expense Management
  expenseCategory: string;
  amount: string;
  date: string;
  receiptPhoto: string;
  status: string;
  approve: string;
  reject: string;
  pending: string;
  approved: string;
  rejected: string;
  submitExpense: string;
  diesel: string;
  tolls: string;
  hotel: string;
  meals: string;
  otherExpenses: string;
  
  // Order Management
  createOrder: string;
  orderDate: string;
  productRef: string;
  description: string;
  quantity: string;
  unitPrice: string;
  totalAmount: string;
  orderStatus: string;
  addOrderItem: string;
  submitOrder: string;
  confirmed: string;
  delivered: string;
  
  // Product Catalog
  price: string;
  stockQty: string;
  productPhoto: string;
  searchProduct: string;
  inStock: string;
  outOfStock: string;
  
  // Reports
  dailyReport: string;
  weeklyReport: string;
  monthlyReport: string;
  salesByClient: string;
  exportExcel: string;
  exportPdf: string;
  generateEodReport: string;
  eodSummaryTitle: string;
  managerRealtimeAccess: string;
  
  // Manager Panel
  viewAllReps: string;
  liveLocations: string;
  allExpenses: string;
  allOrders: string;
  
  // Interface
  darkMode: string;
  lightMode: string;
  selectLanguage: string;
  activeWorkspace: string;
  managerView: string;
  salesRepView: string;
  systemRealtimeSync: string;
  notificationNewOrder: string;
  notificationExpenseApproved: string;
  notificationReminder: string;
  repName: string;
  details: string;
  noData: string;
  actions: string;
}

export const translations: Record<'en' | 'fr' | 'ar', TranslationSchema> = {
  en: {
    dashboard: "Dashboard",
    clients: "Clients",
    visits: "Visits",
    catalog: "Product Catalog",
    orders: "Orders",
    expenses: "Expenses",
    reports: "Reports",
    tracking: "GPS Live Tracking",
    simulator: "Mobile Simulator",
    dailySales: "Daily Sales Summary",
    clientsVisited: "Clients Visited",
    totalOrders: "Total Orders",
    totalExpenses: "Total Expenses",
    monthlyStats: "Monthly Statistics",
    performanceCharts: "Performance Charts",
    activeReps: "Sales Representatives",
    recentActivity: "Recent Activities",
    todaySummary: "Today's Summary",
    salesByProduct: "Sales by Product",
    salesByCity: "Sales by City",
    addNewClient: "Add New Client",
    companyName: "Company Name",
    contactPerson: "Contact Person",
    phone: "Phone Number",
    address: "Address",
    latitude: "Latitude",
    longitude: "Longitude",
    city: "City",
    notes: "Notes",
    clientHistory: "Visit History",
    noClientsYet: "No clients registered yet.",
    saveClient: "Save Client",
    recordVisit: "Record Visit",
    dateTime: "Date & Time",
    checkIn: "Check-in",
    checkOut: "Check-out",
    checkedIn: "Checked In",
    checkedOut: "Checked Out",
    visitNotes: "Visit Notes",
    photosUpload: "Photo Receipt / Visit Photo",
    voiceNotes: "Voice Note",
    distanceTraveled: "Distance Traveled",
    dailyMileage: "Daily Mileage",
    locationVerified: "GPS Location Verified",
    outsideRadiusWarning: "Warning: Outside representative client location check-in bounds!",
    expenseCategory: "Expense Category",
    amount: "Amount",
    date: "Date",
    receiptPhoto: "Photo of Receipt",
    status: "Status",
    approve: "Approve",
    reject: "Reject",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    submitExpense: "Submit Expense",
    diesel: "Diesel",
    tolls: "Highway tolls",
    hotel: "Hotel",
    meals: "Meals",
    otherExpenses: "Other expenses",
    createOrder: "Create Order",
    orderDate: "Order Date",
    productRef: "Product Reference",
    description: "Description",
    quantity: "Quantity",
    unitPrice: "Unit Price",
    totalAmount: "Total Amount",
    orderStatus: "Order Status",
    addOrderItem: "Add Product",
    submitOrder: "Submit Order",
    confirmed: "Confirmed",
    delivered: "Delivered",
    price: "Price",
    stockQty: "Stock Quantity",
    productPhoto: "Product Photo",
    searchProduct: "Search product reference or description...",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    dailyReport: "Daily Report",
    weeklyReport: "Weekly Report",
    monthlyReport: "Monthly Report",
    salesByClient: "Sales by Client",
    exportExcel: "Export to Excel",
    exportPdf: "Export to PDF",
    generateEodReport: "Generate End of Day Report",
    eodSummaryTitle: "End of Day Activity Report",
    managerRealtimeAccess: "Manager consults this report in real-time.",
    viewAllReps: "View all sales representatives",
    liveLocations: "View live locations",
    allExpenses: "View expenses",
    allOrders: "View orders",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    selectLanguage: "Language",
    activeWorkspace: "Active Workspace",
    managerView: "Manager Panel",
    salesRepView: "Representative Console",
    systemRealtimeSync: "Real-time Cloud Sync Active",
    notificationNewOrder: "New order placed by rep!",
    notificationExpenseApproved: "Expense request has been approved.",
    notificationReminder: "Daily report submission reminder sent.",
    repName: "Representative",
    details: "Details",
    noData: "No records found.",
    actions: "Actions"
  },
  fr: {
    dashboard: "Tableau de Bord",
    clients: "Clients",
    visits: "Visites",
    catalog: "Catalogue Produits",
    orders: "Commandes",
    expenses: "Dépenses / Frais",
    reports: "Rapports de Vente",
    tracking: "Suivi GPS en Direct",
    simulator: "Simulateur Mobile",
    dailySales: "Résumé des Ventes",
    clientsVisited: "Clients Visités",
    totalOrders: "Total Commandes",
    totalExpenses: "Total Dépenses",
    monthlyStats: "Statistiques Mensuelles",
    performanceCharts: "Graphiques de Performance",
    activeReps: "Représentants Commerciaux",
    recentActivity: "Activités Récentes",
    todaySummary: "Résumé du Jour",
    salesByProduct: "Ventes par Produit",
    salesByCity: "Ventes par Ville",
    addNewClient: "Ajouter un Client",
    companyName: "Nom de l'Entreprise",
    contactPerson: "Interlocuteur",
    phone: "Numéro de Téléphone",
    address: "Adresse",
    latitude: "Latitude",
    longitude: "Longitude",
    city: "Ville",
    notes: "Notes",
    clientHistory: "Historique des Visites",
    noClientsYet: "Aucun client enregistré pour le moment.",
    saveClient: "Enregistrer le Client",
    recordVisit: "Enregistrer la Visite",
    dateTime: "Date & Heure",
    checkIn: "Enregistrer l'Entrée",
    checkOut: "Enregistrer la Sortie",
    checkedIn: "Entrée Validée",
    checkedOut: "Sortie Validée",
    visitNotes: "Notes de Visite",
    photosUpload: "Photo Justificatif / Visite",
    voiceNotes: "Note Vocale",
    distanceTraveled: "Distance Parcourue",
    dailyMileage: "Kilométrage Journalier",
    locationVerified: "Position GPS Vérifiée",
    outsideRadiusWarning: "Attention: Enregistrement hors de la zone du client!",
    expenseCategory: "Catégorie de Dépense",
    amount: "Montant",
    date: "Date",
    receiptPhoto: "Photo du Reçu",
    status: "Statut",
    approve: "Approuver",
    reject: "Rejeter",
    pending: "En attente",
    approved: "Approuvé",
    rejected: "Rejeté",
    submitExpense: "Soumettre la Dépense",
    diesel: "Gazole / Diesel",
    tolls: "Péages autoroutiers",
    hotel: "Hôtel",
    meals: "Repas",
    otherExpenses: "Autres dépenses",
    createOrder: "Créer une Commande",
    orderDate: "Date de la Commande",
    productRef: "Référence Produit",
    description: "Description",
    quantity: "Quantité",
    unitPrice: "Prix Unitaire",
    totalAmount: "Montant Total",
    orderStatus: "Statut Commande",
    addOrderItem: "Ajouter Produit",
    submitOrder: "Valider la Commande",
    confirmed: "Confirmé",
    delivered: "Livré",
    price: "Prix",
    stockQty: "Quantité en Stock",
    productPhoto: "Photo du produit",
    searchProduct: "Rechercher une référence ou une description...",
    inStock: "En Stock",
    outOfStock: "Rupture de Stock",
    dailyReport: "Rapport Journalier",
    weeklyReport: "Rapport Hebdomadaire",
    monthlyReport: "Rapport Mensuel",
    salesByClient: "Ventes par Client",
    exportExcel: "Exporter vers Excel",
    exportPdf: "Exporter en PDF",
    generateEodReport: "Générer le Rapport Journalier de Fin de Journée",
    eodSummaryTitle: "Rapport d'Activité de Fin de Journée",
    managerRealtimeAccess: "Le manager consulte ce rapport en temps réel.",
    viewAllReps: "Voir tous les représentants",
    liveLocations: "Positions en direct",
    allExpenses: "Consulter les dépenses",
    allOrders: "Consulter les commandes",
    darkMode: "Mode Sombre",
    lightMode: "Mode Clair",
    selectLanguage: "Langue",
    activeWorkspace: "Espace de Travail",
    managerView: "Panneau Manager",
    salesRepView: "Console Représentant",
    systemRealtimeSync: "Synchronisation Cloud Active",
    notificationNewOrder: "Nouvelle commande soumise !",
    notificationExpenseApproved: "La note de frais a été approuvée.",
    notificationReminder: "Rappel de soumission d'activité envoyé.",
    repName: "Représentant",
    details: "Détails",
    noData: "Aucune donnée disponible.",
    actions: "Actions"
  },
  ar: {
    dashboard: "لوحة التحكم",
    clients: "العملاء",
    visits: "الزيارات الميدانية",
    catalog: "دليل المنتجات",
    orders: "الطلبات",
    expenses: "المصاريف والنفقات",
    reports: "تقارير المبيعات",
    tracking: "تتبع الموقع المباشر GPS",
    simulator: "محاكي الهاتف المحمول",
    dailySales: "ملخص المبيعات اليومية",
    clientsVisited: "العملاء الذين تمت زيارتهم",
    totalOrders: "إجمالي الطلبات",
    totalExpenses: "إجمالي المصاريف",
    monthlyStats: "الإحصائيات الشهرية",
    performanceCharts: "مخططات الأداء",
    activeReps: "مندوبي المبيعات",
    recentActivity: "آخر الأنشطة",
    todaySummary: "ملخص اليوم",
    salesByProduct: "المبيعات حسب المنتج",
    salesByCity: "المبيعات حسب المدينة",
    addNewClient: "إضافة عميل جديد",
    companyName: "اسم الشركة",
    contactPerson: "الشخص المسؤول",
    phone: "رقم الهاتف",
    address: "العنوان",
    latitude: "خط العرض",
    longitude: "خط الطول",
    city: "المدينة",
    notes: "ملاحظات",
    clientHistory: "سجل الزيارات",
    noClientsYet: "لا يوجد عملاء مسجلين بعد.",
    saveClient: "حفظ العميل",
    recordVisit: "تسجيل زيارة",
    dateTime: "التاريخ والوقت",
    checkIn: "تسجيل الدخول (بدء)",
    checkOut: "تسجيل الخروج (إنهاء)",
    checkedIn: "تم تسجيل الدخول",
    checkedOut: "تم تسجيل الخروج",
    visitNotes: "ملاحظات الزيارة",
    photosUpload: "إرفاق صورة إيصال / زيارة",
    voiceNotes: "المذكرة الصوتية",
    distanceTraveled: "المسافة المقطوعة",
    dailyMileage: "المسافة اليومية (كم)",
    locationVerified: "تم التحقق من موقع GPS",
    outsideRadiusWarning: "تحذير: تسجيل الزيارة خارج نطاق موقع العميل المعتمد!",
    expenseCategory: "فئة المصروفات",
    amount: "المبلغ",
    date: "التاريخ",
    receiptPhoto: "صورة الإيصال",
    status: "الحالة",
    approve: "موافقة",
    reject: "رفض",
    pending: "قيد الانتظار",
    approved: "تمت الموافقة",
    rejected: "مرفوض",
    submitExpense: "تقديم مصروف",
    diesel: "وقود / ديزل",
    tolls: "رسوم الطرق السريعة",
    hotel: "الفندق / السكن",
    meals: "الوجبات / الطعام",
    otherExpenses: "نفقات أخرى",
    createOrder: "إنشاء طلب جديد",
    orderDate: "تاريخ الطلب",
    productRef: "رمز المنتج",
    description: "وصف المنتج",
    quantity: "الكمية",
    unitPrice: "سعر الوحدة",
    totalAmount: "المبلغ الإجمالي",
    orderStatus: "حالة الطلب",
    addOrderItem: "إضافة منتج",
    submitOrder: "إرسال وتأكيد الطلب",
    confirmed: "مؤكد",
    delivered: "تم التوصيل",
    price: "السعر",
    stockQty: "الكمية المتوفرة",
    productPhoto: "صورة المنتج",
    searchProduct: "بحث عن منتج بالرمز أو الوصف...",
    inStock: "متوفر بالخزن",
    outOfStock: "غير متوفر",
    dailyReport: "التقرير اليومي",
    weeklyReport: "التقرير الأسبوعي",
    monthlyReport: "التقرير الشهري",
    salesByClient: "المبيعات حسب العميل",
    exportExcel: "تصدير إلى Excel",
    exportPdf: "تصدير إلى PDF",
    generateEodReport: "توليد تقرير نهاية اليوم الشامل",
    eodSummaryTitle: "تقرير نشاط نهاية اليوم المالي والميداني",
    managerRealtimeAccess: "يمكن للمدير الإطلاع على هذا التقرير مباشرة في الوقت الفعلي.",
    viewAllReps: "عرض جميع المندوبين",
    liveLocations: "المواقع المباشرة للمندوبين",
    allExpenses: "عرض المصاريف والطلبات المالية",
    allOrders: "عرض وإدارة الطلبات",
    darkMode: "المظهر الداكن",
    lightMode: "المظهر المضيء",
    selectLanguage: "اللغة",
    activeWorkspace: "مساحة العمل",
    managerView: "لوحة تحكم المدير",
    salesRepView: "شاشة مندوب المبيعات",
    systemRealtimeSync: "مزامنة سحابية نشطة بالوقت الفعلي",
    notificationNewOrder: "تم إرسال طلب جديد من قبل المندوب الميداني!",
    notificationExpenseApproved: "تمت الموافقة على طلب تغطية النفقات والمصاريف المرفوعة.",
    notificationReminder: "تم إرسال التنبيه اليومي لتقديم تقارير النشاط الميداني.",
    repName: "مندوب المبيعات",
    details: "التفاصيل",
    noData: "لا توجد سجلات حالية.",
    actions: "الإجراءات"
  }
};

export const isRtl = (lang: 'en' | 'fr' | 'ar'): boolean => lang === 'ar';
