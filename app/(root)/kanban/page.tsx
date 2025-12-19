"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Task {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  assignee: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export default function Kanban() {
  const [columns] = useState<Column[]>([
    {
      id: "todo",
      title: "To Do",
      tasks: [
        { id: "1", title: "Fix mobile responsive issues", priority: "high", assignee: "JD" },
        { id: "2", title: "Upgrade project A dependencies", priority: "low", assignee: "SM" },
      ],
    },
    {
      id: "inprogress",
      title: "In Progress",
      tasks: [
        {
          id: "3",
          title: "Implement user authentication system",
          priority: "high",
          assignee: "JD",
        },
      ],
    },
    {
      id: "review",
      title: "Review",
      tasks: [{ id: "4", title: "Design Dashboard", priority: "medium", assignee: "AB" }],
    },
    {
      id: "done",
      title: "Done",
      tasks: [
        { id: "5", title: "Setup project repository", priority: "high", assignee: "JD" },
        { id: "6", title: "Create initial wireframes", priority: "medium", assignee: "AB" },
      ],
    },
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Kanban Board</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {columns.map((column) => (
          <Card key={column.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm font-medium">
                <span>{column.title}</span>
                <Badge variant="secondary" className="ml-auto">
                  {column.tasks.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-3 pt-0">
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-2">
                  {column.tasks.map((task) => (
                    <Card
                      key={task.id}
                      className="cursor-pointer transition-colors hover:bg-accent"
                    >
                      <CardContent className="p-3">
                        <p className="text-sm font-medium mb-2">{task.title}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                            {task.priority}
                          </Badge>
                          <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {task.assignee}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
