export const mockUsers = [
  { id: 1, name: "John Smith", username: "jssmith", firstName: "John", lastName: "Smith", role: "Staff", skills: ["Network", "Fire Safety"], available: true, dept: "IT", phone: "555-1111", email: "john.smith@example.com", status: "Active", lastActive: "2025-01-20" },
  { id: 2, name: "Sarah Johnson", username: "sjohnson", firstName: "Sarah", lastName: "Johnson", role: "Staff", skills: ["CCTV", "Access Control"], available: true, dept: "Security", phone: "555-2222", email: "sarah.johnson@example.com", status: "Active", lastActive: "2025-01-21" },
  { id: 3, name: "Mike Davis", username: "mdavis", firstName: "Mike", lastName: "Davis", role: "Staff", skills: ["Biometric", "Network"], available: false, dept: "IT", phone: "555-3333", email: "mike.davis@example.com", status: "Inactive", lastActive: "2025-01-18" },
  { id: 4, name: "Lisa Wilson", username: "lwilson", firstName: "Lisa", lastName: "Wilson", role: "Admin", skills: ["Electrical", "Fire Safety"], available: true, dept: "Facilities", phone: "555-4444", email: "lisa.wilson@example.com", status: "Active", lastActive: "2025-01-21" },
  { id: 5, name: "Tom Brown", username: "tbrown", firstName: "Tom", lastName: "Brown", role: "Staff", skills: ["Network", "CCTV"], available: true, dept: "IT", phone: "555-5555", email: "tom.brown@example.com", status: "Active", lastActive: "2025-01-19" },
];

export const mockClients = [
  {
    id: 1,
    name: 'ABCD Corporation',
    contactPerson: 'Sarah Johnson',
    phone: '+1-555-0123',
    openTasks: 3,
    lastVisit: '2025-01-14',
    sites: [
      {
        id: 1,
        name: 'Main Office',
        address: '123 Business Ave, New York, NY',
        googleMapsLink: 'https://maps.google.com/?q=123+Business+Ave,+New+York,+NY',
        contactNumber: '+1-555-0456',
        siteContactPerson: 'John Doe',
        siteContactPosition: 'Office Manager'
      },
      {
        id: 2,
        name: 'Warehouse',
        address: '456 Storage St, New York, NY',
        googleMapsLink: 'https://maps.google.com/?q=456+Storage+St,+New+York,+NY',
        contactNumber: '+1-555-0789',
        siteContactPerson: 'Jane Smith',
        siteContactPosition: 'Warehouse Supervisor'
      }
    ],
    recentTasks: [
      { id: 1, title: 'Network Installation', date: '2025-01-10', status: 'Completed' },
      { id: 2, title: 'CCTV Setup', date: '2024-12-15', status: 'Completed' },
    ],
    taskTypeIds: [1, 2, 4],
    serviceTypes: ["Installation", "Maintenance", "Repair"],
  },
  {
    id: 2,
    name: 'XYZ Inc', // Name from FloatingAddButton
    contactPerson: 'John Smith',
    phone: '+1-555-0234',
    openTasks: 1,
    lastVisit: '2025-01-12',
    sites: [
      {
        id: 3,
        name: 'HQ Building',
        address: '789 Tech Park, San Francisco, CA',
        googleMapsLink: 'https://maps.google.com/?q=789+Tech+Park,+San+Francisco,+CA',
        contactNumber: '+1-555-0678',
        siteContactPerson: 'Peter Jones',
        siteContactPosition: 'Facilities Manager'
      }
    ],
    recentTasks: [
      { id: 3, title: 'Biometric Setup', date: '2025-01-12', status: 'New' }
    ],
    taskTypeIds: [2, 5],
    serviceTypes: ["Inspection", "Installation"],
  },
  {
    id: 3,
    name: "Tech Solutions",
    contactPerson: 'Jane Doe',
    phone: '+1-555-1111',
    openTasks: 0,
    lastVisit: '2025-01-20',
    sites: [{ id: 4, name: "Head Office", address: "321 Innovation Drive", googleMapsLink: 'https://maps.google.com/?q=321+Innovation+Drive', contactNumber: '+1-555-1112', siteContactPerson: 'Tech Contact', siteContactPosition: 'Support Lead' }],
    taskTypeIds: [1, 3, 5],
    serviceTypes: ["Maintenance", "Upgrade"],
    recentTasks: [],
  },
  {
    id: 4,
    name: "Global Systems",
    contactPerson: 'Tom Wilson',
    phone: '+1-555-2222',
    openTasks: 2,
    lastVisit: '2025-01-18',
    sites: [
      { id: 5, name: "Corporate HQ", address: "654 Enterprise Blvd", googleMapsLink: 'https://maps.google.com/?q=654+Enterprise+Blvd', contactNumber: '+1-555-2223', siteContactPerson: 'HQ Contact', siteContactPosition: 'Manager' },
      { id: 6, name: "Data Center", address: "987 Server Lane", googleMapsLink: 'https://maps.google.com/?q=987+Server+Lane', contactNumber: '+1-555-2224', siteContactPerson: 'DC Contact', siteContactPosition: 'Admin' },
    ],
    taskTypeIds: [1, 2, 3, 4, 5],
    serviceTypes: ["Installation", "Maintenance", "Audit"],
    recentTasks: [],
  },
];

export const mockTaskTypes = [
  { id: 1, name: "Network Installation", skillRequired: "Network", active: true },
  { id: 2, name: "CCTV Setup", skillRequired: "CCTV", active: true },
  { id: 3, name: "Biometric Installation", skillRequired: "Biometric", active: true },
  { id: 4, name: "Access Control Setup", skillRequired: "Access Control", active: true },
  { id: 5, name: "Fire Safety Installation", skillRequired: "Fire Safety", active: true },
];

export const mockTasks = [
  {
    id: 1,
    title: "Network Setup - Building A",
    taskType: "Network Installation",
    client: "ABC Corporation",
    clientSite: "Main Office",
    siteMapUrl: "https://maps.google.com/?q=ABC+Corporation+Main+Office",
    assignedTo: "John Smith",
    priority: "High",
    status: "In Progress",
    dueDate: "2025-01-15",
    skillRequired: "Network",
    description: "Install and configure network infrastructure for the new building",
  },
  {
    id: 2,
    title: "CCTV Installation - Parking Lot",
    taskType: "CCTV Setup",
    client: "XYZ Inc",
    clientSite: "HQ Building",
    siteMapUrl: "https://maps.google.com/?q=789+Tech+Park,+San+Francisco,+CA",
    assignedTo: "Sarah Johnson",
    priority: "Medium",
    status: "Pending",
    dueDate: "2025-01-20",
    skillRequired: "CCTV",
    description: "Install 12 CCTV cameras in the parking area",
  },
  {
    id: 3,
    title: "Biometric Access Control",
    taskType: "Biometric Installation",
    client: "Tech Solutions",
    clientSite: "Head Office",
    siteMapUrl: "https://maps.google.com/?q=321+Innovation+Drive",
    assignedTo: "Mike Davis",
    priority: "Critical",
    status: "Completed",
    dueDate: "2025-01-10",
    skillRequired: "Biometric",
    description: "Install biometric scanners at main entrance",
  },
  {
    id: 4,
    title: "Fire Safety System Check",
    taskType: "Fire Safety Installation",
    client: "ABC Corporation",
    clientSite: "Warehouse",
    siteMapUrl: "https://maps.google.com/?q=456+Storage+St,+New+York,+NY",
    assignedTo: "Lisa Wilson",
    priority: "High",
    status: "Pending",
    dueDate: "2025-01-12",
    skillRequired: "Fire Safety",
    description: "Quarterly fire safety system inspection",
  },
  {
    id: 5,
    title: "Router Configuration",
    taskType: "Network Installation",
    client: "Global Systems",
    clientSite: "Data Center",
    siteMapUrl: "https://maps.google.com/?q=987+Server+Lane",
    assignedTo: "Tom Brown",
    priority: "Low",
    status: "In Progress",
    dueDate: "2025-01-18",
    skillRequired: "Network",
    description: "Configure new network routers",
  },
];

export const priorities = ["Low", "Medium", "High", "Critical"];
export const statuses = ["New", "Pending", "In Progress", "On Hold", "Completed", "Cancelled"];

export const mockTransactions = [
  {
    id: 1,
    number: 'V001',
    date: '2025-01-15',
    vno: 'PV-2025-001',
    payBy: 'Company Account',
    payTo: 'Tech Supplier Ltd',
    description: 'Network cables and switches',
    amount: -1250.00,
    taskId: 'T001',
    user: 'John Doe'
  },
  {
    id: 2,
    number: 'V002',
    date: '2025-01-14',
    vno: 'RV-2025-001',
    payBy: 'ABC Corporation',
    payTo: 'Company Account',
    description: 'Payment for network installation',
    amount: 3500.00,
    taskId: 'T001',
    user: 'Jane Smith'
  },
  {
    id: 3,
    number: 'V003',
    date: '2025-01-13',
    vno: 'PV-2025-002',
    payBy: 'Company Account',
    payTo: 'Security Systems Inc',
    description: 'CCTV cameras (4x)',
    amount: -800.00,
    taskId: 'T002',
    user: 'Mike Johnson'
  },
  {
    id: 4,
    number: 'V004',
    date: '2025-01-12',
    vno: 'RV-2025-002',
    payBy: 'XYZ Limited',
    payTo: 'Company Account',
    description: 'Payment for CCTV maintenance',
    amount: 1200.00,
    taskId: 'T002',
    user: 'John Doe'
  },
];

export const operationsData = [
  {
    category: 'John Doe',
    tasks: 15,
    hours: 45.5,
    avgDuration: '3.0h',
    completion: 93
  },
  {
    category: 'Jane Smith',
    tasks: 12,
    hours: 38.0,
    avgDuration: '3.2h',
    completion: 100
  },
  {
    category: 'Mike Johnson',
    tasks: 8,
    hours: 28.5,
    avgDuration: '3.6h',
    completion: 87
  }
];

export const financialData = [
  {
    category: 'Network Services',
    income: 12500,
    expenses: 3200,
    profit: 9300
  },
  {
    category: 'Security Systems',
    income: 8900,
    expenses: 2100,
    profit: 6800
  },
  {
    category: 'Maintenance',
    income: 5600,
    expenses: 1800,
    profit: 3800
  }
];

export const chartData = [
  { name: 'John Doe', tasks: 15, hours: 45.5 },
  { name: 'Jane Smith', tasks: 12, hours: 38.0 },
  { name: 'Mike Johnson', tasks: 8, hours: 28.5 },
];

export const pieData = [
  { name: 'Network Services', value: 9300, color: '#8884d8' },
  { name: 'Security Systems', value: 6800, color: '#82ca9d' },
  { name: 'Maintenance', value: 3800, color: '#ffc658' },
];

// --- Technician (User app) mock data ---
export type TechnicianTaskStatus = 'New' | 'In Progress' | 'Completed';
export type TechnicianPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type TechnicianTask = {
  id: string;
  clientName: string;
  title: string;
  scheduledDate: string; // YYYY-MM-DD
  status: TechnicianTaskStatus;
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  remarks?: string;
  priority?: TechnicianPriority;
  siteName?: string;
  siteMapUrl?: string;
};

const dateKey = (offsetDays = 0) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const mockTechnicianTasks: TechnicianTask[] = [
  {
    id: 'UT-001',
    clientName: 'ABC Corporation',
    title: 'CCTV health check and firmware update',
    scheduledDate: dateKey(0),
    status: 'New',
    priority: 'High',
    siteName: 'Main Office – Lobby',
    siteMapUrl: 'https://maps.google.com/?q=ABC+Corporation+Main+Office',
    remarks: 'Verify camera streams and apply latest firmware.',
  },
  {
    id: 'UT-002',
    clientName: 'XYZ Hotel',
    title: 'Guest Wi‑Fi access point swap (Floor 3)',
    scheduledDate: dateKey(0),
    status: 'In Progress',
    startTime: '09:15',
    priority: 'Medium',
    siteName: 'Tower A – Floor 3 Wing East',
    siteMapUrl: 'https://maps.google.com/?q=XYZ+Hotel+Tower+A',
    remarks: 'Replace AP-3E and re-check roaming.',
  },
  {
    id: 'UT-003',
    clientName: 'Tech Solutions Ltd',
    title: 'Access control reader alignment',
    scheduledDate: dateKey(1),
    status: 'New',
    priority: 'Low',
    siteName: 'Head Office – Entrance B',
    remarks: 'Reader sometimes misses first swipe.',
  },
  {
    id: 'UT-004',
    clientName: 'Green Energy Co',
    title: 'Fire panel monthly inspection',
    scheduledDate: dateKey(2),
    status: 'New',
    priority: 'Critical',
    siteName: 'Plant 2 – Control Room',
    siteMapUrl: 'https://maps.google.com/?q=Green+Energy+Plant+2',
    remarks: 'Follow checklist; record detector counts.',
  },
  {
    id: 'UT-005',
    clientName: 'Metro Construction',
    title: 'Temporary site network setup',
    scheduledDate: dateKey(-1),
    status: 'Completed',
    startTime: '10:05',
    endTime: '13:40',
    priority: 'High',
    remarks: 'Configured DHCP and verified uplink.',
    siteName: 'Site Hut – Rack 1',
  },
  {
    id: 'UT-006',
    clientName: 'ABC Corporation',
    title: 'Replace NVR storage drive (Bay 2)',
    scheduledDate: dateKey(-3),
    status: 'In Progress',
    startTime: '08:30',
    priority: 'High',
    siteName: 'Main Office – Security Room',
    remarks: 'Drive SMART warning; replace and rebuild RAID.',
  },
  {
    id: 'UT-007',
    clientName: 'XYZ Hotel',
    title: 'Room lock audit – Tower B',
    scheduledDate: dateKey(7),
    status: 'New',
    priority: 'Medium',
    siteName: 'Tower B – Rooms 501–520',
  },
  {
    id: 'UT-008',
    clientName: 'Tech Solutions Ltd',
    title: 'UPS battery swap (Server room)',
    scheduledDate: dateKey(-7),
    status: 'Completed',
    startTime: '14:10',
    endTime: '16:05',
    priority: 'Low',
    siteName: 'Server Room',
  },
];
