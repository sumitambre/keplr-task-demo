import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Button } from '@repo/ui';
import { Input } from '@repo/ui';
import { Label } from '@repo/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui';
import { Badge } from '@repo/ui';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@repo/ui';
import { Textarea } from '@repo/ui';
import { Plus, Link, DollarSign } from 'lucide-react';
import { mockTransactions } from '../../database/mockData';

export function PurchasesReceipts() {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('expense');
  const [filters, setFilters] = useState({
    user: 'All',
    startDate: '',
    endDate: ''
  });
  const [formData, setFormData] = useState({
    vno: '',
    payBy: '',
    payTo: '',
    description: '',
    amount: '',
    taskId: ''
  });

  const filteredTransactions = transactions.filter(transaction => {
    if (filters.user !== 'All' && transaction.user !== filters.user) return false;
    if (filters.startDate && transaction.date < filters.startDate) return false;
    if (filters.endDate && transaction.date > filters.endDate) return false;
    return true;
  });

  const totalIn = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOut = filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const handleAdd = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setFormData({
      vno: '',
      payBy: '',
      payTo: '',
      description: '',
      amount: '',
      taskId: ''
    });
    setIsAddOpen(true);
  };

  const handleSave = () => {
    const newTransaction = {
      id: Math.max(...transactions.map(t => t.id)) + 1,
      number: `V${String(Math.max(...transactions.map(t => t.id)) + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      vno: formData.vno,
      payBy: formData.payBy,
      payTo: formData.payTo,
      description: formData.description,
      amount: transactionType === 'expense' ? -Math.abs(parseFloat(formData.amount)) : Math.abs(parseFloat(formData.amount)),
      taskId: formData.taskId,
      user: 'Current User' // In real app, this would be the logged-in user
    };
    
    setTransactions([...transactions, newTransaction]);
    setIsAddOpen(false);
  };

  const formatAmount = (amount: number) => {
    const formatted = Math.abs(amount).toFixed(2);
    return amount >= 0 ? `+$${formatted}` : `-$${formatted}`;
  };

  const getAmountColor = (amount: number) => {
    return amount >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1>Purchases & Receipts</h1>
        <div className="flex gap-2">
          <Button onClick={() => handleAdd('income')} variant="default">
            <Plus className="h-4 w-4 mr-2" />
            Add Income
          </Button>
          <Button onClick={() => handleAdd('expense')} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>User</Label>
              <Select value={filters.user} onValueChange={(value) => setFilters({...filters, user: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="John Doe">John Doe</SelectItem>
                  <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                  <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Start Date</Label>
              <Input 
                type="date" 
                value={filters.startDate} 
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              />
            </div>
            
            <div>
              <Label>End Date</Label>
              <Input 
                type="date" 
                value={filters.endDate} 
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>V.No</TableHead>
                <TableHead>Pay By</TableHead>
                <TableHead>Pay To</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Task#</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.number}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.vno}</TableCell>
                  <TableCell>{transaction.payBy}</TableCell>
                  <TableCell>{transaction.payTo}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className={getAmountColor(transaction.amount)}>
                    {formatAmount(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    {transaction.taskId && (
                      <Button size="sm" variant="link" className="p-0 h-auto">
                        <Link className="h-3 w-3 mr-1" />
                        {transaction.taskId}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>{transaction.user}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Amount In</p>
                <p className="text-2xl text-green-600">+${totalIn.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Amount Out</p>
                <p className="text-2xl text-red-600">-${totalOut.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add New {transactionType === 'income' ? 'Income' : 'Expense'} Transaction
            </DialogTitle>
            <DialogDescription>
              Record a new {transactionType === 'income' ? 'payment received' : 'payment made'} transaction for tracking financial activities.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              You are adding a <strong>{transactionType === 'income' ? 'payment received' : 'payment made'}</strong> transaction.
            </div>
            
            <div>
              <Label htmlFor="vno">Voucher Number</Label>
              <Input
                id="vno"
                value={formData.vno}
                onChange={(e) => setFormData({...formData, vno: e.target.value})}
                placeholder="e.g., PV-2025-001"
              />
            </div>
            
            <div>
              <Label htmlFor="payBy">Pay By</Label>
              <Input
                id="payBy"
                value={formData.payBy}
                onChange={(e) => setFormData({...formData, payBy: e.target.value})}
                placeholder="Who is paying"
              />
            </div>
            
            <div>
              <Label htmlFor="payTo">Pay To</Label>
              <Input
                id="payTo"
                value={formData.payTo}
                onChange={(e) => setFormData({...formData, payTo: e.target.value})}
                placeholder="Who is receiving payment"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Transaction description"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="taskId">Related Task (Optional)</Label>
              <Input
                id="taskId"
                value={formData.taskId}
                onChange={(e) => setFormData({...formData, taskId: e.target.value})}
                placeholder="e.g., T001"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1">
                Add Transaction
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsAddOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
