"use client";

import { Calendar, CheckCircle2, GitBranch, PlayCircle, Plus, TrendingUp } from "lucide-react";
import UserName from "@/components/UserName";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const recentTickets = [
    {
      id: 1,
      title: "Implement user authentication system",
      status: "In Progress",
      priority: "high",
    },
    { id: 2, title: "Design Dashboard", status: "Review", priority: "medium" },
    { id: 3, title: "Fix mobile responsive issues", status: "To Do", priority: "high" },
    { id: 4, title: "Upgrade project A dependencies", status: "To Do", priority: "low" },
  ];

  const meetings = [
    { id: 1, title: "Sprint Planning", time: "in 2 hours" },
    { id: 2, title: "Client Review", time: "Tomorrow" },
    { id: 3, title: "Daily Standup", time: "Today" },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <UserName />
          <p className="text-muted-foreground">Here's what's happening with your projects today.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sprint Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">3 days left in current sprint</p>
            <Progress value={68} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meetings Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">One starting in 30 minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+12% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repository Updates</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <div className="text-2xl font-bold">main</div>
              <Badge variant="outline" className="text-xs">
                3↑ 2↓
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Latest on 16 Jan</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Tickets */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Tickets</CardTitle>
              <CardDescription>Latest updates from your team</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      <span className="font-mono text-xs font-medium">TR-{ticket.id}</span>
                    </div>
                    <div>
                      <p className="font-medium">{ticket.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={ticket.status === "In Progress" ? "default" : "outline"}
                          className="text-xs"
                        >
                          {ticket.status}
                        </Badge>
                        <Badge
                          variant={ticket.priority === "high" ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <PlayCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Meetings */}
          <Card>
            <CardHeader>
              <CardTitle>Meetings Today</CardTitle>
              <CardDescription>Upcoming meetings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium">{meeting.title}</p>
                    <p className="text-sm text-muted-foreground">{meeting.time}</p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <PlayCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Team */}
          <Card>
            <CardHeader>
              <CardTitle>WeConnect People</CardTitle>
              <CardDescription>Currently working</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Avatar key={i} className="border-2 border-background">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        U{i}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div>
                  <p className="font-medium">4 members online</p>
                  <p className="text-xs text-muted-foreground">3 more offline</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Sprint */}
          <Card>
            <CardHeader>
              <CardTitle>Current Sprint - SP12_W1_2025</CardTitle>
              <CardDescription>Sprint #3 - 3 days remaining</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span>To Do</span>
                  <span className="font-medium">3</span>
                </div>
                <Progress value={30} />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span>In Progress</span>
                  <span className="font-medium">8</span>
                </div>
                <Progress value={80} />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span>Review</span>
                  <span className="font-medium">2</span>
                </div>
                <Progress value={20} />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span>Done</span>
                  <span className="font-medium">5</span>
                </div>
                <Progress value={50} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
