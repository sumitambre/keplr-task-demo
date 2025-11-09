import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Button } from '@repo/ui';
import { Input } from '@repo/ui';
import { Label } from '@repo/ui';
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from '@repo/ui';
import { Badge } from '@repo/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@repo/ui';
import { Eye, Plus, MapPin, Phone, User, ExternalLink, Trash2, Pencil, Calendar, Building2 } from 'lucide-react';
import FormBuilder from './forms/FormBuilder';
import { clientFormSchema } from './forms/clientSchema';
import { mockClients } from '../../database/mockData';
import { ResponsiveCardTable } from './ResponsiveCardTable';

const emptyClient = {
  name: '',
  contactPerson: '',
  phone: '',
  sites: [{
    name: '',
    contactNumber: '',
    address: '',
    googleMapsLink: '',
    siteContactPerson: '',
    siteContactPosition: ''
  }],
};

export function Clients() {
  const [clients, setClients] = useState(mockClients);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [formTitle, setFormTitle] = useState('');

  const handleViewClient = (client: any) => {
    setSelectedClient(client);
    setIsDetailOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Completed': 'default',
      'In-Progress': 'secondary',
      'New': 'destructive'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const handleOpenAddForm = () => {
    setEditingClient(JSON.parse(JSON.stringify(emptyClient))); // Deep copy
    setFormTitle('Add New Client');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (client: any) => {
    setEditingClient(JSON.parse(JSON.stringify(client))); // Deep copy
    setFormTitle('Edit Client');
    setIsFormOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditingClient((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (section: 'sites', index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingClient((prev: any) => {
      const newSection = [...prev[section]];
      newSection[index] = { ...newSection[index], [name]: value };
      return { ...prev, [section]: newSection };
    });
  };

  const addSubItem = (section: 'sites') => {
    const newItem = {
        name: '',
        contactNumber: '',
        address: '',
        googleMapsLink: '',
        siteContactPerson: '',
        siteContactPosition: ''
      };
    setEditingClient((prev: any) => ({ ...prev, [section]: [...prev[section], newItem] }));
  };

  const removeSubItem = (section: 'sites', index: number) => {
    setEditingClient((prev: any) => ({
      ...prev,
      [section]: prev[section].filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSave = () => {
    if (!editingClient) return;

    if (editingClient.id) {
      // Edit logic
      console.log('Updating client:', editingClient);
      setClients(clients.map(c => c.id === editingClient.id ? editingClient : c));
    } else {
      // Add logic
      console.log('Saving new client:', editingClient);
      const newClient = { ...editingClient, id: Math.random(), openTasks: 0, lastVisit: new Date().toISOString().split('T')[0], recentTasks: [] };
      setClients([newClient, ...clients]);
    }
    setIsFormOpen(false);
    setEditingClient(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1>Clients</h1>
        <Button onClick={handleOpenAddForm}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Management</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveCardTable
            table={
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Open Tasks</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.contactPerson}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>
                        <Badge variant={client.openTasks > 0 ? 'destructive' : 'default'}>
                          {client.openTasks}
                        </Badge>
                      </TableCell>
                      <TableCell>{client.lastVisit}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewClient(client)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleOpenEditForm(client)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            }
            cards={clients.map((client) => (
              <Card key={client.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">{client.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{client.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{client.phone}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant={client.openTasks > 0 ? 'destructive' : 'default'}>
                      {client.openTasks} open
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{client.lastVisit}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{client.sites?.length ?? 0} site{(client.sites?.length ?? 0) === 1 ? '' : 's'}</span>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleViewClient(client)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleOpenEditForm(client)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
            cardsClassName="space-y-4"
          />
        </CardContent>
      </Card>

      {/* Client Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-full m-0 p-4 md:p-0 md:max-w-4xl md:max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedClient?.name}</DialogTitle>
            <DialogDescription>
              View and manage client details, sites, and task history.
            </DialogDescription>
          </DialogHeader>

          {selectedClient && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="sites">Sites</TabsTrigger>
                <TabsTrigger value="tasks">Task History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p><strong>Contact Person:</strong> {selectedClient.contactPerson}</p>
                      <p><strong>Phone:</strong> {selectedClient.phone}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p><strong>Open Tasks:</strong> {selectedClient.openTasks}</p>
                      <p><strong>Total Sites:</strong> {selectedClient.sites.length}</p>
                      <p><strong>Last Visit:</strong> {selectedClient.lastVisit}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="sites" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3>Client Sites</h3>                  
                </div>

                {selectedClient.sites && selectedClient.sites.length > 0 ? (
                  <div className="space-y-4">
                    {selectedClient.sites.map((site: any, index: number) => (
                      <Card key={site.id ?? index}>
                        <CardContent className="pt-6 space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold">{site.name}</h4>
                          </div>
                          <p className="text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {site.address}
                          </p>
                          {site.googleMapsLink && (
                            <a href={site.googleMapsLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-2">
                              <ExternalLink className="h-4 w-4" />
                              View on Google Maps
                            </a>
                          )}
                          {site.contactNumber && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              {site.contactNumber}
                            </p>
                          )}
                          {site.siteContactPerson && (
                            <div className="text-sm text-muted-foreground pt-2 border-t mt-2">
                              <p>
                                <strong>Site Contact:</strong> {site.siteContactPerson}
                                {site.siteContactPosition ? ` (${site.siteContactPosition})` : ''}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No sites found for this client.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4">
                <h3>Task History</h3>
                {selectedClient.recentTasks && selectedClient.recentTasks.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedClient.recentTasks.map((task: any) => (
                        <TableRow key={task.id}>
                          <TableCell>{task.title}</TableCell>
                          <TableCell>{task.date}</TableCell>
                          <TableCell>{getStatusBadge(task.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No recent tasks found for this client.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Client Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        {/* Dialog container uses flex column; let FormBuilder manage internal scroll */}
        <DialogContent className="w-full m-0 p-4 md:p-0 md:max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingClient && editingClient.id ? `Edit Client: ${editingClient.name}` : 'Add New Client'}
            </DialogTitle>
          </DialogHeader>

          {editingClient && (
            <div className="py-4 pr-2 flex-1 min-h-0">
              <FormBuilder
                schema={clientFormSchema}
                value={editingClient}
                onChange={(next) => setEditingClient(next)}
                onSave={handleSave}
                onCancel={() => { setIsFormOpen(false); setEditingClient(null); }}
                submitLabel="Save Client"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}



