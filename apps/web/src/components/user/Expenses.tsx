import React, { useState } from 'react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { Textarea } from '@repo/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/card';
import { Badge } from '@repo/ui/badge';
import type { Expense, Task } from '../App';
import { ArrowLeft, Plus, Camera, DollarSign } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface ExpensesProps {
  expenses: Expense[];
  tasks: Task[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onBack: () => void;
}

export function Expenses({ expenses, tasks, onAddExpense, onBack }: ExpensesProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [receiptPhoto, setReceiptPhoto] = useState('');
  const ExpenseSchema = z.object({
    amount: z.string().refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, 'Amount must be greater than 0'),
    category: z.string().min(1, 'Category is required'),
    linkedTaskId: z.string().optional(),
    notes: z.string().optional(),
  });
  const form = useForm<{ amount: string; category: string; linkedTaskId?: string; notes?: string }>({
    resolver: zodResolver(ExpenseSchema),
    defaultValues: { amount: '', category: '', linkedTaskId: '', notes: '' },
  });
  const { control, handleSubmit, formState, reset } = form;

  const categories = [
    'Fuel',
    'Materials',
    'Tools',
    'Transportation',
    'Meals',
    'Parking',
    'Other'
  ];

  const handleAddPhoto = () => {
    // Mock photo addition
    const mockPhotoUrl = `https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop`;
    setReceiptPhoto(mockPhotoUrl);
  };

  const onSubmitForm = handleSubmit((values) => {
    onAddExpense({
      date: new Date().toISOString().split('T')[0],
      category: values.category,
      amount: Number(values.amount),
      notes: values.notes || undefined,
      receiptPhoto: receiptPhoto || undefined,
      linkedTaskId: values.linkedTaskId || undefined,
    });
    reset();
    setReceiptPhoto('');
    setShowAddForm(false);
  });

  const getTaskName = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    return task ? `${task.clientName} - ${task.title}` : 'Unknown Task';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl">Expenses</h1>
          </div>
          <Button 
            variant="secondary"
            size="sm"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        <p className="text-sm opacity-90">Track your work-related expenses</p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Add New Expense Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); onSubmitForm(); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Controller
                        control={control}
                        name="amount"
                        render={({ field }) => (
                          <Input id="amount" type="number" step="0.01" placeholder="0.00" className="pl-10" {...field} />
                        )}
                      />
                      {formState.errors.amount && (
                        <p className="text-xs text-destructive">{formState.errors.amount.message as any}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Controller
                      control={control}
                      name="category"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {formState.errors.category && (
                      <p className="text-xs text-destructive">{formState.errors.category.message as any}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Linked Task (Optional)</Label>
                  <Controller
                    control={control}
                    name="linkedTaskId"
                    render={({ field }) => (
                      <Select value={field.value || ''} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select related task" />
                        </SelectTrigger>
                        <SelectContent>
                          {tasks.map(task => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.clientName} - {task.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Controller
                    control={control}
                    name="notes"
                    render={({ field }) => (
                      <Textarea placeholder="Add notes about this expense..." rows={3} {...field} />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Receipt Photo</Label>
                  <div className="space-y-2">
                    {receiptPhoto && (
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden max-w-xs">
                        <img 
                          src={receiptPhoto} 
                          alt="Receipt"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={handleAddPhoto}
                      className="w-full"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      {receiptPhoto ? 'Change Photo' : 'Add Receipt Photo'}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Add Expense
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Expenses List */}
        <div className="space-y-3">
          <h3>Recent Expenses</h3>
          {expenses.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                No expenses recorded yet.
              </CardContent>
            </Card>
          ) : (
            expenses.map(expense => (
              <Card key={expense.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">${expense.amount.toFixed(2)}</span>
                        <Badge variant="secondary">{expense.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                      {expense.notes && (
                        <p className="text-sm mt-1">{expense.notes}</p>
                      )}
                      {expense.linkedTaskId && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Linked to: {getTaskName(expense.linkedTaskId)}
                        </p>
                      )}
                    </div>
                    {expense.receiptPhoto && (
                      <div className="w-16 h-12 bg-muted rounded overflow-hidden ml-2">
                        <img 
                          src={expense.receiptPhoto} 
                          alt="Receipt"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary */}
        {expenses.length > 0 && (
          <Card className="bg-muted">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Expenses</span>
                <span className="text-lg font-semibold">
                  ${expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
