export interface User {
  id: string;
  email: string;
  role: 'sales_rep' | 'manager';
  full_name: string;
  avatar_url?: string;
  current_lat?: number;
  current_lng?: number;
  last_location_update?: string;
}

export interface Client {
  id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface Product {
  id: string;
  reference: string;
  description: string;
  category: string;
  price: number;
  stock_quantity: number;
  photo_url?: string;
}

export interface Visit {
  id: string;
  client_id: string;
  sales_rep_id: string;
  check_in_time: string;
  check_out_time?: string;
  check_in_lat: number;
  check_in_lng: number;
  check_out_lat?: number;
  check_out_lng?: number;
  notes?: string;
  photo_url?: string;
  voice_note_url?: string;
}

export interface Expense {
  id: string;
  sales_rep_id: string;
  category: 'Diesel' | 'Highway tolls' | 'Hotel' | 'Meals' | 'Other expenses';
  amount: number;
  expense_date: string;
  photo_url?: string;
  notes?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approved_by?: string;
  approved_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  client_id: string;
  sales_rep_id: string;
  order_date: string;
  total_amount: number;
  status: 'Pending' | 'Confirmed' | 'Delivered';
  items?: OrderItem[];
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'order' | 'expense' | 'reminder';
}

export interface DailyReport {
  id: string;
  sales_rep_id: string;
  report_date: string;
  visited_clients_count: number;
  total_expenses: number;
  total_orders_count: number;
  total_sales_amount: number;
  report_data: {
    visits: Visit[];
    orders: Order[];
    expenses: Expense[];
    mileage: number;
  };
  created_at: string;
}

// Initial seed data
const initialUsers: User[] = [
  {
    id: "user-mgr-01",
    email: "manager@wholesale.com",
    role: "manager",
    full_name: "Emily Vance (Manager)",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100"
  },
  {
    id: "user-rep-01",
    email: "jean.rep@wholesale.com",
    role: "sales_rep",
    full_name: "Jean-Luc Picard",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
    current_lat: 48.8566,
    current_lng: 2.3522,
    last_location_update: new Date().toISOString()
  },
  {
    id: "user-rep-02",
    email: "youssef.rep@wholesale.com",
    role: "sales_rep",
    full_name: "Youssef Alami",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100",
    current_lat: 33.5731,
    current_lng: -7.5898,
    last_location_update: new Date().toISOString()
  }
];

const initialClients: Client[] = [
  {
    id: "client-01",
    company_name: "Paris Fashion Hub",
    contact_person: "Sophie Laurent",
    phone: "+33 1 47 20 00 01",
    address: "12 Avenue des Champs-Élysées",
    latitude: 48.8698,
    longitude: 2.3075,
    city: "Paris",
    notes: "Key wholesale client. Prefers premium items.",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "client-02",
    company_name: "Lyon Denim Store",
    contact_person: "Pierre Dubois",
    phone: "+33 4 72 00 11 22",
    address: "45 Rue de la République",
    latitude: 45.7640,
    longitude: 4.8357,
    city: "Lyon",
    notes: "Orders regularly. Pays within 30 days.",
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "client-03",
    company_name: "Marrakech Souk Styles",
    contact_person: "Khadija Benani",
    phone: "+212 524 400 100",
    address: "Place Jemaa el-Fnaa, Medina",
    latitude: 31.6295,
    longitude: -7.9811,
    city: "Marrakech",
    notes: "Prefers bulk purchases of linen shirts and casual t-shirts.",
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "client-04",
    company_name: "Casablanca Outlet",
    contact_person: "Amina Bensalah",
    phone: "+212 522 200 300",
    address: "Boulevard d'Anfa",
    latitude: 33.5898,
    longitude: -7.6039,
    city: "Casablanca",
    notes: "High volume buyer. Focuses on seasonal discount clearance.",
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "client-05",
    company_name: "Nice Riviera Trends",
    contact_person: "Lucas Martin",
    phone: "+33 4 93 00 55 66",
    address: "15 Promenade des Anglais",
    latitude: 43.6961,
    longitude: 7.2656,
    city: "Nice",
    notes: "Boutique store, targets summer tourists.",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const initialProducts: Product[] = [
  {
    id: "prod-01",
    reference: "REF-JEANS-01",
    description: "Premium Slim Fit Blue Jeans",
    category: "Jeans",
    price: 45.00,
    stock_quantity: 150,
    photo_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "prod-02",
    reference: "REF-SHIRT-02",
    description: "Casual White Linen Shirt",
    category: "Shirts",
    price: 35.00,
    stock_quantity: 85,
    photo_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "prod-03",
    reference: "REF-JACKET-03",
    description: "Classic Black Leather Jacket",
    category: "Jackets",
    price: 120.00,
    stock_quantity: 40,
    photo_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "prod-04",
    reference: "REF-COAT-04",
    description: "Camel Wool Trench Coat",
    category: "Coats",
    price: 180.00,
    stock_quantity: 25,
    photo_url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "prod-05",
    reference: "REF-TSHIRT-05",
    description: "Organic Cotton White T-shirt",
    category: "T-shirts",
    price: 18.00,
    stock_quantity: 300,
    photo_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "prod-06",
    reference: "REF-DRESS-06",
    description: "Floral Cotton Summer Dress",
    category: "Dresses",
    price: 65.00,
    stock_quantity: 95,
    photo_url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=200"
  }
];

const initialVisits: Visit[] = [
  {
    id: "visit-01",
    client_id: "client-01",
    sales_rep_id: "user-rep-01",
    check_in_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
    check_out_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 3.2 * 60 * 60 * 1000).toISOString(),
    check_in_lat: 48.8695,
    check_in_lng: 2.3070,
    check_out_lat: 48.8699,
    check_out_lng: 2.3079,
    notes: "Sophie Laurent requested details on incoming autumn coats.",
    photo_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: "visit-02",
    client_id: "client-03",
    sales_rep_id: "user-rep-02",
    check_in_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
    check_out_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000).toISOString(),
    check_in_lat: 31.6290,
    check_in_lng: -7.9815,
    check_out_lat: 31.6295,
    check_out_lng: -7.9810,
    notes: "Met with Khadija. Checked inventory levels. Placing order for summer linen shirts.",
    voice_note_url: "#"
  }
];

const initialExpenses: Expense[] = [
  {
    id: "exp-01",
    sales_rep_id: "user-rep-01",
    category: "Diesel",
    amount: 65.50,
    expense_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: "Filled tank for road trip to Lyon.",
    status: "Approved",
    approved_by: "user-mgr-01",
    approved_at: new Date(Date.now() - 1.8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "exp-02",
    sales_rep_id: "user-rep-01",
    category: "Highway tolls",
    amount: 22.40,
    expense_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: "A6 Highway toll Paris to Lyon.",
    status: "Pending"
  },
  {
    id: "exp-03",
    sales_rep_id: "user-rep-02",
    category: "Meals",
    amount: 32.00,
    expense_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: "Client lunch in Marrakech.",
    status: "Pending"
  }
];

const initialOrders: Order[] = [
  {
    id: "order-01",
    client_id: "client-01",
    sales_rep_id: "user-rep-01",
    order_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    total_amount: 1475.00,
    status: "Delivered",
    items: [
      { id: "item-01", order_id: "order-01", product_id: "prod-01", quantity: 15, unit_price: 45.00, total_price: 675.00 },
      { id: "item-02", order_id: "order-01", product_id: "prod-02", quantity: 10, unit_price: 35.00, total_price: 350.00 },
      { id: "item-03", order_id: "order-01", product_id: "prod-05", quantity: 25, unit_price: 18.00, total_price: 450.00 }
    ]
  },
  {
    id: "order-02",
    client_id: "client-03",
    sales_rep_id: "user-rep-02",
    order_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    total_amount: 2025.00,
    status: "Confirmed",
    items: [
      { id: "item-04", order_id: "order-02", product_id: "prod-02", quantity: 30, unit_price: 35.00, total_price: 1050.00 },
      { id: "item-05", order_id: "order-02", product_id: "prod-06", quantity: 15, unit_price: 65.00, total_price: 975.00 }
    ]
  }
];

const initialNotifications: Notification[] = [
  {
    id: "notif-01",
    message: "New order #order-02 ($2,025.00) confirmed for Marrakech Souk Styles.",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    read: false,
    type: "order"
  },
  {
    id: "notif-02",
    message: "Expense of $65.50 (Diesel) submitted by Jean-Luc Picard has been Approved.",
    timestamp: new Date(Date.now() - 1.8 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    type: "expense"
  }
];

// Database state accessor
class MockDatabase {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify(initialUsers));
    }
    if (!localStorage.getItem('clients')) {
      localStorage.setItem('clients', JSON.stringify(initialClients));
    }
    if (!localStorage.getItem('products')) {
      localStorage.setItem('products', JSON.stringify(initialProducts));
    }
    if (!localStorage.getItem('visits')) {
      localStorage.setItem('visits', JSON.stringify(initialVisits));
    }
    if (!localStorage.getItem('expenses')) {
      localStorage.setItem('expenses', JSON.stringify(initialExpenses));
    }
    if (!localStorage.getItem('orders')) {
      localStorage.setItem('orders', JSON.stringify(initialOrders));
    }
    if (!localStorage.getItem('notifications')) {
      localStorage.setItem('notifications', JSON.stringify(initialNotifications));
    }
  }

  // Generic methods
  private get<T>(key: string): T[] {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  private set<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
    // Dispatch custom event to notify React components of changes
    window.dispatchEvent(new Event('mock_db_update'));
  }

  // Users
  getUsers(): User[] {
    return this.get<User>('users');
  }

  updateUserLocation(userId: string, lat: number, lng: number) {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].current_lat = lat;
      users[userIndex].current_lng = lng;
      users[userIndex].last_location_update = new Date().toISOString();
      this.set('users', users);
    }
  }

  // Clients
  getClients(): Client[] {
    return this.get<Client>('clients');
  }

  addClient(client: Omit<Client, 'id' | 'created_at'>): Client {
    const clients = this.getClients();
    const newClient: Client = {
      ...client,
      id: `client-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    clients.push(newClient);
    this.set('clients', clients);
    return newClient;
  }

  // Products
  getProducts(): Product[] {
    return this.get<Product>('products');
  }

  updateProductStock(productId: string, quantitySold: number) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
      products[index].stock_quantity = Math.max(0, products[index].stock_quantity - quantitySold);
      this.set('products', products);
    }
  }

  // Visits
  getVisits(): Visit[] {
    return this.get<Visit>('visits');
  }

  addVisit(visit: Omit<Visit, 'id' | 'created_at'>): Visit {
    const visits = this.getVisits();
    const newVisit: Visit = {
      ...visit,
      id: `visit-${Date.now()}`
    };
    visits.push(newVisit);
    this.set('visits', visits);
    return newVisit;
  }

  updateVisit(visit: Visit): void {
    const visits = this.getVisits();
    const index = visits.findIndex(v => v.id === visit.id);
    if (index !== -1) {
      visits[index] = visit;
      this.set('visits', visits);
    }
  }

  // Expenses
  getExpenses(): Expense[] {
    return this.get<Expense>('expenses');
  }

  addExpense(expense: Omit<Expense, 'id' | 'status' | 'approved_by' | 'approved_at'>): Expense {
    const expenses = this.getExpenses();
    const newExpense: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      status: 'Pending'
    };
    expenses.push(newExpense);
    this.set('expenses', expenses);

    // Add Notification
    const rep = this.getUsers().find(u => u.id === expense.sales_rep_id);
    this.addNotification(
      `New Expense Request: $${expense.amount} (${expense.category}) submitted by ${rep?.full_name || 'Rep'}.`,
      'expense'
    );

    return newExpense;
  }

  updateExpenseStatus(expenseId: string, status: 'Approved' | 'Rejected', managerId: string) {
    const expenses = this.getExpenses();
    const index = expenses.findIndex(e => e.id === expenseId);
    if (index !== -1) {
      expenses[index].status = status;
      expenses[index].approved_by = managerId;
      expenses[index].approved_at = new Date().toISOString();
      this.set('expenses', expenses);

      // Add Notification
      this.addNotification(
        `Expense request for $${expenses[index].amount} has been ${status.toLowerCase()}.`,
        'expense'
      );
    }
  }

  // Orders
  getOrders(): Order[] {
    return this.get<Order>('orders');
  }

  addOrder(order: Omit<Order, 'id' | 'order_date' | 'total_amount' | 'status'>, items: Omit<OrderItem, 'id' | 'order_id'>[]): Order {
    const orders = this.getOrders();
    const orderId = `order-${Date.now()}`;
    
    // Calculate total amount
    const totalAmount = items.reduce((acc, it) => acc + (it.unit_price * it.quantity), 0);

    const fullItems: OrderItem[] = items.map((it, idx) => ({
      ...it,
      id: `item-${Date.now()}-${idx}`,
      order_id: orderId,
      total_price: it.unit_price * it.quantity
    }));

    const newOrder: Order = {
      ...order,
      id: orderId,
      order_date: new Date().toISOString(),
      total_amount,
      status: 'Pending',
      items: fullItems
    };

    orders.push(newOrder);
    this.set('orders', orders);

    // Update product stock
    items.forEach(it => {
      this.updateProductStock(it.product_id, it.quantity);
    });

    // Add Notification
    const rep = this.getUsers().find(u => u.id === order.sales_rep_id);
    const client = this.getClients().find(c => c.id === order.client_id);
    this.addNotification(
      `New Order: ${client?.company_name} - Total: $${totalAmount.toFixed(2)} placed by ${rep?.full_name || 'Rep'}.`,
      'order'
    );

    return newOrder;
  }

  updateOrderStatus(orderId: string, status: 'Pending' | 'Confirmed' | 'Delivered') {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      this.set('orders', orders);
    }
  }

  // Notifications
  getNotifications(): Notification[] {
    return this.get<Notification>('notifications');
  }

  addNotification(message: string, type: 'order' | 'expense' | 'reminder'): Notification {
    const notifications = this.getNotifications();
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type
    };
    notifications.unshift(newNotif); // latest first
    this.set('notifications', notifications.slice(0, 50)); // keep last 50
    return newNotif;
  }

  markNotificationsRead() {
    const notifications = this.getNotifications().map(n => ({ ...n, read: true }));
    this.set('notifications', notifications);
  }

  // Daily mileage calculation mock (simple distance between client visit points)
  getMileageForRep(repId: string, dateStr: string): number {
    const visits = this.getVisits().filter(v => {
      const vDate = v.check_in_time.split('T')[0];
      return v.sales_rep_id === repId && vDate === dateStr;
    });

    if (visits.length <= 1) return visits.length * 8.5; // mock distance

    let totalDist = 0;
    for (let i = 0; i < visits.length - 1; i++) {
      const p1 = visits[i];
      const p2 = visits[i + 1];
      totalDist += this.calculateDistance(
        p1.check_in_lat, p1.check_in_lng,
        p2.check_in_lat, p2.check_in_lng
      );
    }
    return Math.round(totalDist * 10) / 10;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  }

  // Generate real-time reports
  getDailyReports(): DailyReport[] {
    const visits = this.getVisits();
    const orders = this.getOrders();
    const expenses = this.getExpenses();
    const reps = this.getUsers().filter(u => u.role === 'sales_rep');

    const reports: DailyReport[] = [];

    // Group items by rep and date
    const repActivities: Record<string, Record<string, { visits: Visit[], orders: Order[], expenses: Expense[] }>> = {};

    reps.forEach(rep => {
      repActivities[rep.id] = {};
    });

    // Populate visits
    visits.forEach(v => {
      const date = v.check_in_time.split('T')[0];
      if (!repActivities[v.sales_rep_id]) repActivities[v.sales_rep_id] = {};
      if (!repActivities[v.sales_rep_id][date]) {
        repActivities[v.sales_rep_id][date] = { visits: [], orders: [], expenses: [] };
      }
      repActivities[v.sales_rep_id][date].visits.push(v);
    });

    // Populate orders
    orders.forEach(o => {
      const date = o.order_date.split('T')[0];
      if (!repActivities[o.sales_rep_id]) repActivities[o.sales_rep_id] = {};
      if (!repActivities[o.sales_rep_id][date]) {
        repActivities[o.sales_rep_id][date] = { visits: [], orders: [], expenses: [] };
      }
      repActivities[o.sales_rep_id][date].orders.push(o);
    });

    // Populate expenses
    expenses.forEach(e => {
      const date = e.expense_date;
      if (!repActivities[e.sales_rep_id]) repActivities[e.sales_rep_id] = {};
      if (!repActivities[e.sales_rep_id][date]) {
        repActivities[e.sales_rep_id][date] = { visits: [], orders: [], expenses: [] };
      }
      repActivities[e.sales_rep_id][date].expenses.push(e);
    });

    // Build the reports list
    Object.keys(repActivities).forEach(repId => {
      Object.keys(repActivities[repId]).forEach(dateStr => {
        const act = repActivities[repId][dateStr];
        const visited_clients_count = act.visits.length;
        const total_expenses = act.expenses.reduce((s, ex) => s + Number(ex.amount), 0);
        const total_orders_count = act.orders.length;
        const total_sales_amount = act.orders.reduce((s, ord) => s + Number(ord.total_amount), 0);
        const mileage = this.getMileageForRep(repId, dateStr);

        reports.push({
          id: `rep-${repId}-${dateStr}`,
          sales_rep_id: repId,
          report_date: dateStr,
          visited_clients_count,
          total_expenses,
          total_orders_count,
          total_sales_amount,
          report_data: {
            visits: act.visits,
            orders: act.orders,
            expenses: act.expenses,
            mileage
          },
          created_at: new Date(dateStr + "T23:59:59Z").toISOString()
        });
      });
    });

    return reports.sort((a, b) => b.report_date.localeCompare(a.report_date));
  }
}

export const db = new MockDatabase();
