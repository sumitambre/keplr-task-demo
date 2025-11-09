import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";
import { Checkbox } from "./checkbox";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./dialog";
import { Input } from "./input";
import { Label } from "./label";
import React from 'react';

interface ComboboxPopoverProps<T extends { id: number | string; name: string }> {
  title: string;
  items: T[];
  selectedItems: (number | string)[];
  onSelectionChange: (selectedIds: (number | string)[]) => void;
  onAddItem?: (name: string) => void;
  triggerText: string;
  addNewItemText?: string;
  searchPlaceholder: string;
  emptyText: string;
  dialogTitle?: string;
  dialogDescription?: string;
  dialogInputLabel?: string;
  dialogInputPlaceholder?: string;
  dialogButtonText?: string;
  renderHeader?: () => React.ReactNode;
  renderItem?: (item: T) => React.ReactNode;
}

export function ComboboxPopover<T extends { id: number | string; name: string }>({ 
  title,
  items,
  selectedItems,
  onSelectionChange,
  onAddItem,
  triggerText,
  addNewItemText,
  searchPlaceholder,
  emptyText,
  dialogTitle,
  dialogDescription,
  dialogInputLabel,
  dialogInputPlaceholder,
  dialogButtonText,
  renderHeader,
  renderItem,
}: ComboboxPopoverProps<T>) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  const handleToggleItem = (itemId: number | string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    onSelectionChange(Array.from(newSelection));
  };

  const handleAddNewItem = () => {
    if (newItemName.trim() && onAddItem) {
      onAddItem(newItemName.trim());
      setNewItemName("");
      setIsAddDialogOpen(false);
    }
  };

  const selectedItemsText = items
    .filter((item) => selectedItems.includes(item.id))
    .map((item) => item.name)
    .join(', ');

  return (
    <>
      <div className="space-y-2">
        <Label>{title}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {selectedItems.length > 0 ? selectedItemsText : triggerText}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-64 overflow-auto">
            {renderHeader && renderHeader()}
            <Command>
              <CommandInput placeholder={searchPlaceholder} />
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  {items.map((item) =>
                    renderItem ? (
                      <CommandItem
                        key={item.id}
                        value={item.name}
                        onSelect={() => handleToggleItem(item.id)}
                      >
                        {renderItem(item)}
                      </CommandItem>
                    ) : (
                      <CommandItem
                        key={item.id}
                        value={item.name}
                        onSelect={() => handleToggleItem(item.id)}
                      >
                        <Checkbox checked={selectedItems.includes(item.id)} className="mr-2" />
                        {item.name}
                      </CommandItem>
                    )
                  )}
                </CommandGroup>
                {onAddItem && addNewItemText && (
                  <CommandGroup>
                    <CommandItem onSelect={() => setIsAddDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {addNewItemText}
                    </CommandItem>
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {onAddItem && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogDescription>{dialogDescription}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="newItemName">{dialogInputLabel}</Label>
                <Input
                  id="newItemName"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={dialogInputPlaceholder}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" onClick={handleAddNewItem}>
                  {dialogButtonText}
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
