"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";


interface UserInfo {
  userId: string;
  email: string;
  role: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  joinedDate: string;
  projects: number;
  totalSpent?: number;
  totalEarned?: number;
}

interface Project {
  id: string;
  title: string;
  client: string;
  freelancer?: string;
  budget: number;
  status: string;
  createdDate: string;
  dueDate: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  project: string;
  user: string;
  date: string;
  status: string;
}

interface Dispute {
  id: string;
  project: string;
  client: string;
  freelancer: string;
  issue: string;
  priority: string;
  raisedDate: string;
  status: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [allDisputes, setAllDisputes] = useState<Dispute[]>([]);
  const router = useRouter();

  const fetchUserInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        // Ensure user is an admin
        if (userData.role !== 'admin') {
          router.push('/home');
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    // Mock Users Data
    setAllUsers([
      { id: '1', email: 'john.doe@example.com', role: 'client', status: 'Active', joinedDate: '2023-12-01', projects: 3, totalSpent: 1033350 },
      { id: '2', email: 'alice.smith@example.com', role: 'freelancer', status: 'Verified', joinedDate: '2023-11-28', projects: 5, totalEarned: 726250 },
      { id: '3', email: 'mike.brown@example.com', role: 'client', status: 'Pending KYC', joinedDate: '2023-12-05', projects: 1, totalSpent: 207500 },
      { id: '4', email: 'sarah.wilson@example.com', role: 'freelancer', status: 'Active', joinedDate: '2023-11-15', projects: 8, totalEarned: 1261600 },
      { id: '5', email: 'david.jones@example.com', role: 'client', status: 'Active', joinedDate: '2023-10-20', projects: 6, totalSpent: 1568700 },
    ]);

    // Mock Projects Data
    setAllProjects([
      { id: '1', title: 'E-commerce Platform', client: 'John Doe', freelancer: 'Alice Smith', budget: 415000, status: 'Active', createdDate: '2023-12-01', dueDate: '2024-01-15' },
      { id: '2', title: 'Mobile App Design', client: 'Mike Brown', freelancer: 'Sarah Wilson', budget: 207500, status: 'In Review', createdDate: '2023-11-28', dueDate: '2023-12-20' },
      { id: '3', title: 'API Integration', client: 'David Jones', freelancer: 'Alice Smith', budget: 149400, status: 'Disputed', createdDate: '2023-11-25', dueDate: '2023-12-15' },
      { id: '4', title: 'Website Redesign', client: 'John Doe', budget: 265600, status: 'Open', createdDate: '2023-12-08', dueDate: '2024-01-10' },
      { id: '5', title: 'Dashboard Development', client: 'Mike Brown', freelancer: 'Sarah Wilson', budget: 373500, status: 'Completed', createdDate: '2023-10-15', dueDate: '2023-11-30' },
    ]);

    // Mock Transactions Data
    setAllTransactions([
      { id: '1', type: 'Escrow Release', amount: 124500, project: 'E-commerce Platform', user: 'Alice Smith', date: '2023-12-08', status: 'Completed' },
      { id: '2', type: 'Platform Fee', amount: 6225, project: 'E-commerce Platform', user: 'WorkBridge', date: '2023-12-08', status: 'Completed' },
      { id: '3', type: 'Escrow Fund', amount: 66400, project: 'Mobile App Design', user: 'Mike Brown', date: '2023-12-07', status: 'Held' },
      { id: '4', type: 'Refund', amount: 74700, project: 'API Integration', user: 'David Jones', date: '2023-12-06', status: 'Processing' },
      { id: '5', type: 'Payment', amount: 186750, project: 'Dashboard Development', user: 'Sarah Wilson', date: '2023-11-30', status: 'Completed' },
    ]);

    // Mock Disputes Data
    setAllDisputes([
      { id: '1', project: 'API Integration', client: 'David Jones', freelancer: 'Alice Smith', issue: 'Work doesn\'t meet requirements', priority: 'High', raisedDate: '2023-12-06', status: 'Open' },
      { id: '2', project: 'Mobile App Design', client: 'Mike Brown', freelancer: 'Sarah Wilson', issue: 'Delayed payment release', priority: 'Medium', raisedDate: '2023-12-07', status: 'Under Review' },
      { id: '3', project: 'Website Redesign', client: 'John Doe', freelancer: 'Alice Smith', issue: 'Scope creep concerns', priority: 'Low', raisedDate: '2023-12-05', status: 'Resolved' },
    ]);
  }, []);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  const renderUsersView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">All Users</h3>
          <p className="text-gray-600">Manage platform users and their activities</p>
        </div>
        <Button onClick={() => setActiveView('dashboard')}>← Back to Dashboard</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{allUsers.length}</div>
            <p className="text-sm text-gray-500">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{allUsers.filter(u => u.status === 'Active' || u.status === 'Verified').length}</div>
            <p className="text-sm text-gray-500">Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{allUsers.filter(u => u.role === 'client').length}</div>
            <p className="text-sm text-gray-500">Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{allUsers.filter(u => u.role === 'freelancer').length}</div>
            <p className="text-sm text-gray-500">Freelancers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    user.role === 'client' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    <span className="text-sm font-medium">
                      {user.email.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">{user.email}</h4>
                    <p className="text-sm text-gray-500">{user.role} • Joined {user.joinedDate}</p>
                    <p className="text-xs text-gray-400">
                      {user.role === 'client' 
                        ? `Spent: ₹${user.totalSpent?.toLocaleString()}` 
                        : `Earned: ₹${user.totalEarned?.toLocaleString()}`
                      } • {user.projects} projects
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={user.status === 'Active' || user.status === 'Verified' ? 'default' : user.status === 'Pending KYC' ? 'destructive' : 'outline'}>
                    {user.status}
                  </Badge>
                  <Button size="sm" variant="outline">View Profile</Button>
                  <Button size="sm" variant="ghost">Actions</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProjectsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">All Projects</h3>
          <p className="text-gray-600">Monitor platform projects and activities</p>
        </div>
        <Button onClick={() => setActiveView('dashboard')}>← Back to Dashboard</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{allProjects.length}</div>
            <p className="text-sm text-gray-500">Total Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{allProjects.filter(p => p.status === 'Active').length}</div>
            <p className="text-sm text-gray-500">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{allProjects.filter(p => p.status === 'Completed').length}</div>
            <p className="text-sm text-gray-500">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{allProjects.filter(p => p.status === 'Disputed').length}</div>
            <p className="text-sm text-gray-500">Disputed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allProjects.map((project) => (
              <div key={project.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{project.title}</h4>
                    <p className="text-gray-600">Client: {project.client}</p>
                    {project.freelancer && <p className="text-gray-600">Freelancer: {project.freelancer}</p>}
                  </div>
                  <Badge variant={
                    project.status === 'Active' ? 'default' :
                    project.status === 'Completed' ? 'secondary' :
                    project.status === 'Disputed' ? 'destructive' :
                    'outline'
                  }>
                    {project.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                  <div>Budget: <span className="font-medium text-gray-900">₹{project.budget.toLocaleString()}</span></div>
                  <div>Created: <span className="font-medium text-gray-900">{project.createdDate}</span></div>
                  <div>Due: <span className="font-medium text-gray-900">{project.dueDate}</span></div>
                </div>
                <div className="flex space-x-2 mt-3">
                  <Button size="sm" variant="outline">View Details</Button>
                  <Button size="sm" variant="ghost">Manage</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTransactionsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Transaction History</h3>
          <p className="text-gray-600">Complete platform financial activities</p>
        </div>
        <Button onClick={() => setActiveView('dashboard')}>← Back to Dashboard</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{allTransactions.length}</div>
            <p className="text-sm text-gray-500">Total Transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              ₹{allTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">Total Volume</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{allTransactions.filter(t => t.status === 'Completed').length}</div>
            <p className="text-sm text-gray-500">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{allTransactions.filter(t => t.status === 'Processing').length}</div>
            <p className="text-sm text-gray-500">Processing</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div>
                  <h4 className="font-medium">{transaction.type}</h4>
                  <p className="text-sm text-gray-600">{transaction.project}</p>
                  <p className="text-xs text-gray-500">User: {transaction.user}</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    transaction.type === 'Escrow Release' || transaction.type === 'Payment' ? 'text-green-600' :
                    transaction.type === 'Platform Fee' ? 'text-blue-600' :
                    transaction.type === 'Refund' ? 'text-red-600' : 'text-orange-600'
                  }`}>
                    {transaction.type === 'Platform Fee' ? '+' : transaction.type === 'Refund' ? '-' : ''}₹{transaction.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{transaction.date}</p>
                  <Badge variant={transaction.status === 'Completed' ? 'default' : transaction.status === 'Processing' ? 'secondary' : 'outline'} className="text-xs">
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDisputesView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">All Disputes</h3>
          <p className="text-gray-600">Platform dispute management and resolution</p>
        </div>
        <Button onClick={() => setActiveView('dashboard')}>← Back to Dashboard</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{allDisputes.filter(d => d.status === 'Open').length}</div>
            <p className="text-sm text-gray-500">Open Disputes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{allDisputes.filter(d => d.status === 'Under Review').length}</div>
            <p className="text-sm text-gray-500">Under Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{allDisputes.filter(d => d.status === 'Resolved').length}</div>
            <p className="text-sm text-gray-500">Resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{allDisputes.filter(d => d.priority === 'High').length}</div>
            <p className="text-sm text-gray-500">High Priority</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dispute Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allDisputes.map((dispute) => (
              <div key={dispute.id} className={`p-4 border rounded-lg ${
                dispute.priority === 'High' ? 'border-red-200 bg-red-50' :
                dispute.priority === 'Medium' ? 'border-yellow-200 bg-yellow-50' :
                'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">{dispute.project} Dispute</h4>
                    <p className="text-sm text-gray-600 mb-1">{dispute.issue}</p>
                    <p className="text-xs text-gray-500">Client: {dispute.client} | Freelancer: {dispute.freelancer}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant={dispute.priority === 'High' ? 'destructive' : dispute.priority === 'Medium' ? 'secondary' : 'outline'}>
                      {dispute.priority} Priority
                    </Badge>
                    <Badge variant={dispute.status === 'Open' ? 'destructive' : dispute.status === 'Under Review' ? 'secondary' : 'default'}>
                      {dispute.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Raised: {dispute.raisedDate}</span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">Review Details</Button>
                    <Button size="sm" variant={dispute.status === 'Open' ? 'default' : 'ghost'}>
                      {dispute.status === 'Open' ? 'Take Action' : 'View Resolution'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Render different views based on activeView state
  if (activeView === 'users') return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">WorkBridge</h1>
              <Badge variant="destructive">Admin Dashboard</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button onClick={() => router.push('/home')} variant="ghost" size="sm">Home</Button>
              <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {renderUsersView()}
      </main>
    </div>
  );

  if (activeView === 'projects') return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">WorkBridge</h1>
              <Badge variant="destructive">Admin Dashboard</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button onClick={() => router.push('/home')} variant="ghost" size="sm">Home</Button>
              <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {renderProjectsView()}
      </main>
    </div>
  );

  if (activeView === 'transactions') return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">WorkBridge</h1>
              <Badge variant="destructive">Admin Dashboard</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button onClick={() => router.push('/home')} variant="ghost" size="sm">Home</Button>
              <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {renderTransactionsView()}
      </main>
    </div>
  );

  if (activeView === 'disputes') return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">WorkBridge</h1>
              <Badge variant="destructive">Admin Dashboard</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button onClick={() => router.push('/home')} variant="ghost" size="sm">Home</Button>
              <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {renderDisputesView()}
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">WorkBridge</h1>
              <Badge variant="destructive">Admin Dashboard</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button onClick={() => router.push('/home')} variant="ghost" size="sm">
                Home
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="mt-2 text-gray-600">Platform oversight, user management, and system administration</p>
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">1,247</div>
                <p className="text-xs text-gray-500">+18 this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">89</div>
                <p className="text-xs text-gray-500">+5 this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">₹245K</div>
                <p className="text-xs text-gray-500">Platform transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Open Disputes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">3</div>
                <p className="text-xs text-gray-500">Requires attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Users Management Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Oversee platform users and their activities</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setActiveView('users')}>View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">JD</span>
                      </div>
                      <div>
                        <h4 className="font-medium">John Doe</h4>
                        <p className="text-sm text-gray-500">Client • Joined Dec 1</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="outline">Active</Badge>
                      <Button size="sm" variant="ghost">View</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-green-600">AS</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Alice Smith</h4>
                        <p className="text-sm text-gray-500">Freelancer • Joined Nov 28</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="secondary">Verified</Badge>
                      <Button size="sm" variant="ghost">View</Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-orange-600">MB</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Mike Brown</h4>
                        <p className="text-sm text-gray-500">Client • Joined Dec 5</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="destructive">Pending KYC</Badge>
                      <Button size="sm" variant="ghost">View</Button>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" onClick={() => setActiveView('users')}>Manage All Users</Button>
                </div>
              </CardContent>
            </Card>

            {/* Projects Overview Section */}
            <Card>
              <CardHeader>
                <CardTitle>Projects Overview</CardTitle>
                <CardDescription>Monitor platform projects and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">E-commerce Platform</h4>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Full-stack development project</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Client: John Doe</span>
                      <span>Budget: $5,000</span>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">Mobile App Design</h4>
                      <Badge variant="secondary">In Review</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">UI/UX design for mobile application</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Freelancer: Alice Smith</span>
                      <span>Budget: $2,500</span>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">API Integration</h4>
                      <Badge variant="outline">Disputed</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Third-party API integrations</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Requires attention</span>
                      <span>Budget: $1,800</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" onClick={() => setActiveView('projects')}>View All Projects</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Transactions Section */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Platform financial activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Escrow Release</h4>
                      <p className="text-sm text-gray-500">Project: E-commerce Platform</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+$1,500</p>
                      <p className="text-xs text-gray-500">Dec 8, 2023</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Platform Fee</h4>
                      <p className="text-sm text-gray-500">5% commission</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-600">+$75</p>
                      <p className="text-xs text-gray-500">Dec 8, 2023</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Escrow Fund</h4>
                      <p className="text-sm text-gray-500">Project: Mobile App Design</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-orange-600">$800</p>
                      <p className="text-xs text-gray-500">Dec 7, 2023</p>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" onClick={() => setActiveView('transactions')}>View Transaction History</Button>
                </div>
              </CardContent>
            </Card>

            {/* Disputes Section */}
            <Card>
              <CardHeader>
                <CardTitle>Active Disputes</CardTitle>
                <CardDescription>Issues requiring administrative action</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 border-red-200 bg-red-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-red-900">API Integration Dispute</h4>
                      <Badge variant="destructive">High Priority</Badge>
                    </div>
                    <p className="text-sm text-red-700 mb-2">Client claims work doesn&apos;t meet requirements</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-red-600">Raised: Dec 6, 2023</span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">Review</Button>
                        <Button size="sm">Resolve</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 border-yellow-200 bg-yellow-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-yellow-900">Payment Delay Issue</h4>
                      <Badge variant="secondary">Medium</Badge>
                    </div>
                    <p className="text-sm text-yellow-700 mb-2">Freelancer reports delayed payment release</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-yellow-600">Raised: Dec 7, 2023</span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">Review</Button>
                        <Button size="sm">Resolve</Button>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" onClick={() => setActiveView('disputes')}>View All Disputes</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Administrative Tools</CardTitle>
              <CardDescription>Platform management and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => setActiveView('users')}>
                  <div className="text-2xl">👥</div>
                  <span className="text-sm">User Management</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => setActiveView('transactions')}>
                  <div className="text-2xl">📊</div>
                  <span className="text-sm">Analytics</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => setActiveView('transactions')}>
                  <div className="text-2xl">🔍</div>
                  <span className="text-sm">Audit Trail</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => setActiveView('dashboard')}>
                  <div className="text-2xl">⚙️</div>
                  <span className="text-sm">System Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}