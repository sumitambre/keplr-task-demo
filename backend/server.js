require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Allow CORS in dev and simple self-host
app.use(cors({
  origin: true,
  credentials: true,
}));
app.options('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============================================
// In-Memory Database
// ============================================

// Helper to generate date keys
const dateKey = (offsetDays = 0) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Users Database
let users = [
  { id: 1, username: "admin", password: "admin", name: "Admin User", firstName: "Admin", lastName: "User", role: "admin", skills: ["Network", "CCTV", "Fire Safety"], available: true, dept: "Management", phone: "555-0000", email: "admin@example.com", status: "Active", lastActive: dateKey(0) },
  { id: 2, username: "user", password: "user", name: "Test User", firstName: "Test", lastName: "User", role: "user", skills: ["Network"], available: true, dept: "IT", phone: "555-1000", email: "test.user@example.com", status: "Active", lastActive: dateKey(0) },
  { id: 3, username: "jssmith", password: "user", name: "John Smith", firstName: "John", lastName: "Smith", role: "user", skills: ["Network", "Fire Safety"], available: true, dept: "IT", phone: "555-1111", email: "john.smith@example.com", status: "Active", lastActive: dateKey(0) },
  { id: 4, username: "sjohnson", password: "user", name: "Sarah Johnson", firstName: "Sarah", lastName: "Johnson", role: "user", skills: ["CCTV", "Access Control"], available: true, dept: "Security", phone: "555-2222", email: "sarah.johnson@example.com", status: "Active", lastActive: dateKey(0) },
  { id: 5, username: "mdavis", password: "user", name: "Mike Davis", firstName: "Mike", lastName: "Davis", role: "user", skills: ["Biometric", "Network"], available: false, dept: "IT", phone: "555-3333", email: "mike.davis@example.com", status: "Inactive", lastActive: dateKey(-2) },
  { id: 6, username: "lwilson", password: "user", name: "Lisa Wilson", firstName: "Lisa", lastName: "Wilson", role: "admin", skills: ["Electrical", "Fire Safety"], available: true, dept: "Facilities", phone: "555-4444", email: "lisa.wilson@example.com", status: "Active", lastActive: dateKey(0) },
  { id: 7, username: "tbrown", password: "user", name: "Tom Brown", firstName: "Tom", lastName: "Brown", role: "user", skills: ["Network", "CCTV"], available: true, dept: "IT", phone: "555-5555", email: "tom.brown@example.com", status: "Active", lastActive: dateKey(0) },
];

// Clients Database
let clients = [
  {
    id: 1,
    name: 'Omantel',
    contactPerson: 'Ahmed Al Balushi',
    phone: '+968 2424 1234',
    email: 'contact@omantel.om',
    openTasks: 3,
    lastVisit: dateKey(-7),
    sites: [
      {
        id: 1,
        name: 'Omantel HQ',
        address: 'Al Mawaleh, Muscat',
        googleMapsLink: 'https://maps.google.com/?q=Omantel+HQ,+Al+Mawaleh,+Muscat',
        contactNumber: '+968 2424 0000',
        siteContactPerson: 'Khalid Al Said',
        siteContactPosition: 'Operations Manager'
      },
      {
        id: 2,
        name: 'Ruwi Main Office',
        address: 'Ruwi High Street, Muscat',
        googleMapsLink: 'https://maps.google.com/?q=Omantel+Ruwi,+Muscat',
        contactNumber: '+968 2470 1234',
        siteContactPerson: 'Fatima Al Lawati',
        siteContactPosition: 'Branch Manager'
      }
    ],
    taskTypeIds: [1, 2, 4],
    serviceTypes: ["Installation", "Maintenance", "Repair"],
  },
  {
    id: 2,
    name: 'Petroleum Development Oman (PDO)',
    contactPerson: 'Mohammed Al Harthy',
    phone: '+968 2467 8888',
    email: 'info@pdo.co.om',
    openTasks: 1,
    lastVisit: dateKey(-5),
    sites: [
      {
        id: 3,
        name: 'Mina Al Fahal HQ',
        address: 'Mina Al Fahal, Muscat',
        googleMapsLink: 'https://maps.google.com/?q=PDO+HQ,+Mina+Al+Fahal',
        contactNumber: '+968 2467 0000',
        siteContactPerson: 'Said Al Amri',
        siteContactPosition: 'Security Chief'
      },
      {
        id: 4,
        name: 'Ras Al Hamra Club',
        address: 'Ras Al Hamra, Muscat',
        googleMapsLink: 'https://maps.google.com/?q=Ras+Al+Hamra+Club',
        contactNumber: '+968 2467 5555',
        siteContactPerson: 'Sarah Al Zadjali',
        siteContactPosition: 'Facilities Coordinator'
      }
    ],
    taskTypeIds: [2, 5],
    serviceTypes: ["Inspection", "Installation"],
  },
  {
    id: 3,
    name: "Bank Muscat",
    contactPerson: 'Layla Al Raisi',
    phone: '+968 2479 5555',
    email: 'support@bankmuscat.com',
    openTasks: 0,
    lastVisit: dateKey(-1),
    sites: [
      { id: 5, name: "Head Office", address: "Airport Heights, Seeb", googleMapsLink: 'https://maps.google.com/?q=Bank+Muscat+Head+Office', contactNumber: '+968 2476 8000', siteContactPerson: 'Omar Al Balushi', siteContactPosition: 'IT Director' },
      { id: 6, name: "Al Khuwair Branch", address: "Al Khuwair 33, Muscat", googleMapsLink: 'https://maps.google.com/?q=Bank+Muscat+Al+Khuwair', contactNumber: '+968 2448 9999', siteContactPerson: 'Nasser Al Wahaibi', siteContactPosition: 'Branch Manager' }
    ],
    taskTypeIds: [1, 3, 5],
    serviceTypes: ["Maintenance", "Upgrade"],
  },
  {
    id: 4,
    name: "Ooredoo Oman",
    contactPerson: 'Jason Thomas',
    phone: '+968 9500 9500',
    email: 'business@ooredoo.om',
    openTasks: 2,
    lastVisit: dateKey(-3),
    sites: [
      { id: 7, name: "Ooredoo HQ", address: "Muscat Grand Mall, Tilal Complex", googleMapsLink: 'https://maps.google.com/?q=Ooredoo+Oman+HQ', contactNumber: '+968 9500 0000', siteContactPerson: 'Muna Al Khalili', siteContactPosition: 'Office Admin' },
      { id: 8, name: "Al Khoudh Store", address: "Al Khoudh Souq, Seeb", googleMapsLink: 'https://maps.google.com/?q=Ooredoo+Al+Khoudh', contactNumber: '+968 9500 1234', siteContactPerson: 'Ali Al Jabri', siteContactPosition: 'Store Manager' },
    ],
    taskTypeIds: [1, 2, 3, 4, 5],
    serviceTypes: ["Installation", "Maintenance", "Audit"],
  },
  {
    id: 5,
    name: "Muscat Electricity Distribution Company",
    contactPerson: 'Ibrahim Al Farsi',
    phone: '+968 8007 0008',
    email: 'info@medc.co.om',
    openTasks: 1,
    lastVisit: dateKey(-2),
    sites: [
      { id: 9, name: "Main Office", address: "Airport Heights, Muscat", googleMapsLink: 'https://maps.google.com/?q=MEDC+Main+Office', contactNumber: '+968 2458 8888', siteContactPerson: 'Salim Al Habsi', siteContactPosition: 'Operations Lead' },
    ],
    taskTypeIds: [1, 4],
    serviceTypes: ["Repair", "Inspection"],
  }
];

// Task Types Database
let taskTypes = [
  { id: 1, name: "Network Installation", skillRequired: "Network", active: true },
  { id: 2, name: "CCTV Setup", skillRequired: "CCTV", active: true },
  { id: 3, name: "Biometric Installation", skillRequired: "Biometric", active: true },
  { id: 4, name: "Access Control Setup", skillRequired: "Access Control", active: true },
  { id: 5, name: "Fire Safety Installation", skillRequired: "Fire Safety", active: true },
];

// Tasks Database
let tasks = [
  {
    id: 1,
    title: "Fiber Optic Upgrade - Omantel HQ",
    taskType: "Network Installation",
    taskTypeId: 1,
    client: "Omantel",
    clientId: 1,
    clientSite: "Omantel HQ",
    siteId: 1,
    siteMapUrl: "https://maps.google.com/?q=Omantel+HQ,+Al+Mawaleh,+Muscat",
    assignedTo: "John Smith",
    assignedUserId: 3,
    priority: "High",
    status: "In Progress",
    dueDate: dateKey(5),
    scheduledDate: dateKey(0),
    skillRequired: "Network",
    description: "Upgrade core fiber backbone for the HQ building.",
    startTime: "09:00",
    remarks: "Access card required for server room.",
    contactName: "Khalid Al Said",
    contactNumber: "+968 2424 0000",
    sessions: [],
    beforePhotos: [],
    afterPhotos: [],
    signature: null,
    ack: null
  },
  {
    id: 2,
    title: "CCTV Maintenance - Mina Al Fahal",
    taskType: "CCTV Setup",
    taskTypeId: 2,
    client: "Petroleum Development Oman (PDO)",
    clientId: 2,
    clientSite: "Mina Al Fahal HQ",
    siteId: 3,
    siteMapUrl: "https://maps.google.com/?q=PDO+HQ,+Mina+Al+Fahal",
    assignedTo: "Sarah Johnson",
    assignedUserId: 4,
    priority: "Medium",
    status: "New",
    dueDate: dateKey(10),
    scheduledDate: dateKey(2),
    skillRequired: "CCTV",
    description: "Routine maintenance of perimeter cameras.",
    remarks: "Safety induction required before entry.",
    contactName: "Said Al Amri",
    contactNumber: "+968 2467 0000",
    sessions: [],
    beforePhotos: [],
    afterPhotos: [],
    signature: null,
    ack: null
  },
  {
    id: 3,
    title: "ATM Maintenance - Al Khuwair",
    taskType: "Biometric Installation",
    taskTypeId: 3,
    client: "Bank Muscat",
    clientId: 3,
    clientSite: "Al Khuwair Branch",
    siteId: 6,
    siteMapUrl: "https://maps.google.com/?q=Bank+Muscat+Al+Khuwair",
    assignedTo: "Mike Davis",
    assignedUserId: 5,
    priority: "Critical",
    status: "Completed",
    dueDate: dateKey(-5),
    scheduledDate: dateKey(-7),
    skillRequired: "Biometric",
    description: "Biometric sensor calibration for ATM #45.",
    startTime: "08:00",
    endTime: "12:30",
    remarks: "Completed successfully.",
    contactName: "Nasser Al Wahaibi",
    contactNumber: "+968 2448 9999",
    sessions: [],
    beforePhotos: [],
    afterPhotos: [],
    signature: null,
    ack: null
  },
  {
    id: 4,
    title: "5G Tower Inspection",
    taskType: "Network Installation",
    taskTypeId: 1,
    client: "Ooredoo Oman",
    clientId: 4,
    clientSite: "Ooredoo HQ",
    siteId: 7,
    siteMapUrl: "https://maps.google.com/?q=Ooredoo+Oman+HQ",
    assignedTo: "Tom Brown",
    assignedUserId: 6,
    priority: "High",
    status: "New",
    dueDate: dateKey(3),
    scheduledDate: dateKey(1),
    skillRequired: "Network",
    description: "Inspect rooftop 5G equipment.",
    remarks: "Key available at reception.",
    contactName: "Muna Al Khalili",
    contactNumber: "+968 9500 0000",
    sessions: [],
    beforePhotos: [],
    afterPhotos: [],
    signature: null,
    ack: null
  },
  {
    id: 5,
    title: "Substation Repair",
    taskType: "Fire Safety Installation",
    taskTypeId: 5,
    client: "Muscat Electricity Distribution Company",
    clientId: 5,
    clientSite: "Main Office",
    siteId: 9,
    siteMapUrl: "https://maps.google.com/?q=MEDC+Main+Office",
    assignedTo: "Lisa Wilson",
    assignedUserId: 2,
    priority: "Critical",
    status: "In Progress",
    dueDate: dateKey(1),
    scheduledDate: dateKey(0),
    skillRequired: "Fire Safety",
    description: "Repair fire alarm panel in substation B.",
    startTime: "10:00",
    remarks: "Urgent request.",
    contactName: "Salim Al Habsi",
    contactNumber: "+968 2458 8888",
    sessions: [],
    beforePhotos: [],
    afterPhotos: [],
    signature: null,
    ack: null
  }
];

// Transactions/Purchases Database
let transactions = [
  {
    id: 1,
    number: 'V001',
    date: dateKey(-6),
    vno: 'PV-2025-001',
    payBy: 'Company Account',
    payTo: 'Tech Supplier Ltd',
    description: 'Network cables and switches',
    amount: -1250.00,
    taskId: 1,
    user: 'John Smith'
  },
  {
    id: 2,
    number: 'V002',
    date: dateKey(-7),
    vno: 'RV-2025-001',
    payBy: 'ABC Corporation',
    payTo: 'Company Account',
    description: 'Payment for network installation',
    amount: 3500.00,
    taskId: 1,
    user: 'Admin User'
  },
  {
    id: 3,
    number: 'V003',
    date: dateKey(-8),
    vno: 'PV-2025-002',
    payBy: 'Company Account',
    payTo: 'Security Systems Inc',
    description: 'CCTV cameras (4x)',
    amount: -800.00,
    taskId: 2,
    user: 'Sarah Johnson'
  },
  {
    id: 4,
    number: 'V004',
    date: dateKey(-9),
    vno: 'RV-2025-002',
    payBy: 'XYZ Inc',
    payTo: 'Company Account',
    description: 'Payment for CCTV maintenance',
    amount: 1200.00,
    taskId: 2,
    user: 'Admin User'
  },
];

// ID counters
let nextUserId = 8;
let nextClientId = 5;
let nextTaskId = 6;
let nextTaskTypeId = 6;
let nextTransactionId = 5;
let nextSiteId = 7;

// ============================================
// Authentication Routes
// ============================================

// Login Endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (user && user.password === password) {
    console.log(`✅ Login successful for ${username}`);

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful!',
      token: `jwt-token-${user.id}-${Date.now()}`,
      user: userWithoutPassword
    });
  } else {
    console.log(`❌ Login failed for ${username}`);
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Logout Endpoint
app.post('/api/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// ============================================
// Users Routes
// ============================================

// Get all users
app.get('/api/users', (req, res) => {
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json(usersWithoutPasswords);
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (user) {
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Create user
app.post('/api/users', (req, res) => {
  const newUser = {
    id: nextUserId++,
    ...req.body,
    status: req.body.status || 'Active',
    available: req.body.available !== undefined ? req.body.available : true,
    lastActive: dateKey(0)
  };
  users.push(newUser);
  const { password, ...userWithoutPassword } = newUser;
  console.log('✅ Created user:', newUser.username);
  res.status(201).json(userWithoutPassword);
});

// Update user
app.put('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index !== -1) {
    users[index] = { ...users[index], ...req.body };
    const { password, ...userWithoutPassword } = users[index];
    console.log('✅ Updated user:', users[index].username);
    res.json(userWithoutPassword);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index !== -1) {
    const deleted = users.splice(index, 1);
    console.log('✅ Deleted user:', deleted[0].username);
    res.json({ message: 'User deleted successfully' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// ============================================
// Clients Routes
// ============================================

// Get all clients
app.get('/api/clients', (req, res) => {
  res.json(clients);
});

// Get client by ID
app.get('/api/clients/:id', (req, res) => {
  const client = clients.find(c => c.id === parseInt(req.params.id));
  if (client) {
    res.json(client);
  } else {
    res.status(404).json({ message: 'Client not found' });
  }
});

// Create client
app.post('/api/clients', (req, res) => {
  const newClient = {
    id: nextClientId++,
    ...req.body,
    openTasks: 0,
    lastVisit: dateKey(0),
    sites: req.body.sites || []
  };

  // Assign IDs to sites if they don't have them
  newClient.sites = newClient.sites.map(site => ({
    ...site,
    id: site.id || nextSiteId++
  }));

  clients.push(newClient);
  console.log('✅ Created client:', newClient.name);
  res.status(201).json(newClient);
});

// Update client
app.put('/api/clients/:id', (req, res) => {
  const index = clients.findIndex(c => c.id === parseInt(req.params.id));
  if (index !== -1) {
    // Handle sites updates
    if (req.body.sites) {
      req.body.sites = req.body.sites.map(site => ({
        ...site,
        id: site.id || nextSiteId++
      }));
    }

    clients[index] = { ...clients[index], ...req.body };
    console.log('✅ Updated client:', clients[index].name);
    res.json(clients[index]);
  } else {
    res.status(404).json({ message: 'Client not found' });
  }
});

// Delete client
app.delete('/api/clients/:id', (req, res) => {
  const index = clients.findIndex(c => c.id === parseInt(req.params.id));
  if (index !== -1) {
    const deleted = clients.splice(index, 1);
    console.log('✅ Deleted client:', deleted[0].name);
    res.json({ message: 'Client deleted successfully' });
  } else {
    res.status(404).json({ message: 'Client not found' });
  }
});

// ============================================
// Task Types Routes
// ============================================

// Get all task types
app.get('/api/task-types', (req, res) => {
  res.json(taskTypes);
});

// Get task type by ID
app.get('/api/task-types/:id', (req, res) => {
  const taskType = taskTypes.find(t => t.id === parseInt(req.params.id));
  if (taskType) {
    res.json(taskType);
  } else {
    res.status(404).json({ message: 'Task type not found' });
  }
});

// Create task type
app.post('/api/task-types', (req, res) => {
  const newTaskType = {
    id: nextTaskTypeId++,
    ...req.body,
    active: req.body.active !== undefined ? req.body.active : true
  };
  taskTypes.push(newTaskType);
  console.log('✅ Created task type:', newTaskType.name);
  res.status(201).json(newTaskType);
});

// Update task type
app.put('/api/task-types/:id', (req, res) => {
  const index = taskTypes.findIndex(t => t.id === parseInt(req.params.id));
  if (index !== -1) {
    taskTypes[index] = { ...taskTypes[index], ...req.body };
    console.log('✅ Updated task type:', taskTypes[index].name);
    res.json(taskTypes[index]);
  } else {
    res.status(404).json({ message: 'Task type not found' });
  }
});

// Delete task type
app.delete('/api/task-types/:id', (req, res) => {
  const index = taskTypes.findIndex(t => t.id === parseInt(req.params.id));
  if (index !== -1) {
    const deleted = taskTypes.splice(index, 1);
    console.log('✅ Deleted task type:', deleted[0].name);
    res.json({ message: 'Task type deleted successfully' });
  } else {
    res.status(404).json({ message: 'Task type not found' });
  }
});

// ============================================
// Tasks Routes
// ============================================

// Get all tasks
app.get('/api/tasks', (req, res) => {
  const { status, assignedUserId, clientId } = req.query;
  let filteredTasks = tasks;

  if (status) {
    filteredTasks = filteredTasks.filter(t => t.status === status);
  }
  if (assignedUserId) {
    filteredTasks = filteredTasks.filter(t => t.assignedUserId === parseInt(assignedUserId));
  }
  if (clientId) {
    filteredTasks = filteredTasks.filter(t => t.clientId === parseInt(clientId));
  }

  res.json(filteredTasks);
});

// Get task by ID
app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (task) {
    res.json(task);
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
});

// Create task
app.post('/api/tasks', (req, res) => {
  const newTask = {
    id: nextTaskId++,
    ...req.body,
    status: req.body.status || 'New',
    scheduledDate: req.body.scheduledDate || dateKey(0)
  };

  // Update client's open tasks count
  if (newTask.clientId) {
    const client = clients.find(c => c.id === newTask.clientId);
    if (client) {
      client.openTasks = (client.openTasks || 0) + 1;
    }
  }

  tasks.push(newTask);
  console.log('✅ Created task:', newTask.title);
  res.status(201).json(newTask);
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (index !== -1) {
    const oldTask = tasks[index];
    tasks[index] = { ...oldTask, ...req.body };

    // Update client's open tasks if status changed to/from completed
    if (oldTask.status !== tasks[index].status) {
      if (oldTask.clientId) {
        const client = clients.find(c => c.id === oldTask.clientId);
        if (client) {
          if (tasks[index].status === 'Completed' && oldTask.status !== 'Completed') {
            client.openTasks = Math.max(0, (client.openTasks || 0) - 1);
          } else if (tasks[index].status !== 'Completed' && oldTask.status === 'Completed') {
            client.openTasks = (client.openTasks || 0) + 1;
          }
        }
      }
    }

    console.log('✅ Updated task:', tasks[index].title);
    res.json(tasks[index]);
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (index !== -1) {
    const deleted = tasks[index];

    // Update client's open tasks count
    if (deleted.clientId && deleted.status !== 'Completed') {
      const client = clients.find(c => c.id === deleted.clientId);
      if (client) {
        client.openTasks = Math.max(0, (client.openTasks || 0) - 1);
      }
    }

    tasks.splice(index, 1);
    console.log('✅ Deleted task:', deleted.title);
    res.json({ message: 'Task deleted successfully' });
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
});

// ============================================
// Transactions/Purchases Routes
// ============================================

// Get all transactions
app.get('/api/transactions', (req, res) => {
  const { taskId } = req.query;
  let filteredTransactions = transactions;

  if (taskId) {
    filteredTransactions = filteredTransactions.filter(t => t.taskId === parseInt(taskId));
  }

  res.json(filteredTransactions);
});

// Get transaction by ID
app.get('/api/transactions/:id', (req, res) => {
  const transaction = transactions.find(t => t.id === parseInt(req.params.id));
  if (transaction) {
    res.json(transaction);
  } else {
    res.status(404).json({ message: 'Transaction not found' });
  }
});

// Create transaction
app.post('/api/transactions', (req, res) => {
  const newTransaction = {
    id: nextTransactionId++,
    number: `V${String(nextTransactionId).padStart(3, '0')}`,
    date: dateKey(0),
    ...req.body
  };
  transactions.push(newTransaction);
  console.log('✅ Created transaction:', newTransaction.number);
  res.status(201).json(newTransaction);
});

// Update transaction
app.put('/api/transactions/:id', (req, res) => {
  const index = transactions.findIndex(t => t.id === parseInt(req.params.id));
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...req.body };
    console.log('✅ Updated transaction:', transactions[index].number);
    res.json(transactions[index]);
  } else {
    res.status(404).json({ message: 'Transaction not found' });
  }
});

// Delete transaction
app.delete('/api/transactions/:id', (req, res) => {
  const index = transactions.findIndex(t => t.id === parseInt(req.params.id));
  if (index !== -1) {
    const deleted = transactions.splice(index, 1);
    console.log('✅ Deleted transaction:', deleted[0].number);
    res.json({ message: 'Transaction deleted successfully' });
  } else {
    res.status(404).json({ message: 'Transaction not found' });
  }
});

// ============================================
// Dashboard/Stats Routes
// ============================================

app.get('/api/dashboard/stats', (req, res) => {
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'Active').length,
    totalClients: clients.length,
    totalTasks: tasks.length,
    newTasks: tasks.filter(t => t.status === 'New').length,
    inProgressTasks: tasks.filter(t => t.status === 'In Progress').length,
    completedTasks: tasks.filter(t => t.status === 'Completed').length,
    totalRevenue: transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)),
  };
  res.json(stats);
});

// ============================================
// Health Check
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: {
      users: users.length,
      clients: clients.length,
      tasks: tasks.length,
      taskTypes: taskTypes.length,
      transactions: transactions.length
    }
  });
});



// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../apps/web/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../apps/web/build/index.html'));
});

// ============================================
// Start Server
// ============================================

app.listen(PORT, () => {
  console.log('================================================');
  console.log('🚀 Keplr Task Backend Server');
  console.log('================================================');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🔍 API Health Check: http://localhost:${PORT}/api/health`);
  console.log('================================================');
  console.log('📊 Database Status:');
  console.log(`   👥 Users: ${users.length}`);
  console.log(`   🏢 Clients: ${clients.length}`);
  console.log(`   ✅ Tasks: ${tasks.length}`);
  console.log(`   📋 Task Types: ${taskTypes.length}`);
  console.log(`   💰 Transactions: ${transactions.length}`);
  console.log('================================================');
});
