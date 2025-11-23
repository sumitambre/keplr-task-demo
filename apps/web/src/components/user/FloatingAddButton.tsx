import { useState } from "react";
import { Button } from "@repo/ui";
import { Plus } from "lucide-react";
import { TaskDialog } from "../admin/FloatingAddButton";

export function FloatingAddButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Add Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
        size="icon"
        title="Add Task"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Reuse the same TaskDialog from admin */}
      <TaskDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
