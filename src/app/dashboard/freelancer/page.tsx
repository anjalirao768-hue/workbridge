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

interface Project {
  id: string;
  title: string;
  client: string;
  budget: number;
  status: string;
  skills: string[];
  description: string;
  postedDate: string;
  isApplied?: boolean;
}

interface ActiveWork {
  id: string;
  title: string;
  client: string;
  budget: number;
  progress: number;
  dueDate: string;
  status: string;
}

interface Earning {
  id: string;
  project: string;
  amount: number;
  date: string;
  status: string;
}

interface Submission {
  id: string;
  title: string;
  project: string;
  submittedDate: string;
  status: string;
  feedback?: string;
}

export default function FreelancerDashboard() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [myActiveWork, setMyActiveWork] = useState<ActiveWork[]>([]);
  const [myEarnings, setMyEarnings] = useState<Earning[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const router = useRouter();

  const fetchUserInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        // Ensure user is a freelancer
        if (userData.role !== 'freelancer') {
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
    // Mock Available Projects
    setAvailableProjects([
      {
        id: '1',
        title: 'React Dashboard Development',
        client: 'TechCorp Inc.',
        budget: 290500,
        status: 'Open',
        skills: ['React', 'TypeScript', 'Dashboard'],
        description: 'Build an admin dashboard with React and TypeScript for data visualization.',
        postedDate: '2023-12-08',
        isApplied: false
      },
      {
        id: '2',
        title: 'E-commerce API Integration',
        client: 'ShopSmart Ltd.',
        budget: 182600,
        status: 'Open',
        skills: ['Node.js', 'API', 'Backend'],
        description: 'Integrate third-party APIs with existing Node.js backend system.',
        postedDate: '2023-12-07',
        isApplied: true
      },
      {
        id: '3',
        title: 'Mobile App UI Design',
        client: 'StartupXYZ',
        budget: 149400,
        status: 'Open',
        skills: ['UI/UX', 'Figma', 'Mobile'],
        description: 'Design modern and intuitive UI for iOS and Android mobile application.',
        postedDate: '2023-12-06',
        isApplied: false
      },
      {
        id: '4',
        title: 'WordPress Website Development',
        client: 'LocalBiz Co.',
        budget: 124500,
        status: 'Open',
        skills: ['WordPress', 'PHP', 'CSS'],
        description: 'Create a professional business website using WordPress with custom theme.',
        postedDate: '2023-12-05',
        isApplied: false
      },
      {
        id: '5',
        title: 'Data Analysis & Visualization',
        client: 'Analytics Pro',
        budget: 232400,
        status: 'Open',
        skills: ['Python', 'Data Science', 'Visualization'],
        description: 'Analyze large datasets and create interactive visualizations and reports.',
        postedDate: '2023-12-04',
        isApplied: false
      }
    ]);

    // Mock Active Work
    setMyActiveWork([
      {
        id: '1',
        title: 'E-commerce Website',
        client: 'John Doe',
        budget: 415000,
        progress: 65,
        dueDate: '2024-01-15',
        status: 'In Progress'
      },
      {
        id: '2',
        title: 'CRM System Backend',
        client: 'Business Corp',
        budget: 265600,
        progress: 30,
        dueDate: '2024-02-01',
        status: 'Active'
      }
    ]);

    // Mock Earnings
    setMyEarnings([
      { id: '1', project: 'Dashboard Development', amount: 186750, date: '2023-11-30', status: 'Paid' },
      { id: '2', project: 'API Integration', amount: 149400, date: '2023-12-05', status: 'Pending' },
      { id: '3', project: 'Website Redesign', amount: 124500, date: '2023-11-25', status: 'Paid' },
      { id: '4', project: 'Mobile App Design', amount: 174300, date: '2023-12-08', status: 'In Escrow' },
      { id: '5', project: 'E-commerce Frontend', amount: 265600, date: '2023-11-20', status: 'Paid' },
      { id: '6', project: 'Database Optimization', amount: 78850, date: '2023-11-15', status: 'Paid' }
    ]);

    // Mock Submissions
    setMySubmissions([
      {
        id: '1',
        title: 'Frontend Implementation',
        project: 'E-commerce Website',
        submittedDate: '2023-12-08',
        status: 'Under Review',
        feedback: undefined
      },
      {
        id: '2',
        title: 'Database Design',
        project: 'CRM System Backend',
        submittedDate: '2023-12-05',
        status: 'Revision Requested',
        feedback: 'Please optimize the query performance and add proper indexing'
      },
      {
        id: '3',
        title: 'UI Components',
        project: 'Dashboard Development',
        submittedDate: '2023-12-01',
        status: 'Approved',
        feedback: 'Excellent work! All requirements met perfectly.'
      }
    ]);
  }, []);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  const renderProjectsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Available Projects</h3>
          <p className="text-gray-600">Discover new opportunities matching your skills</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setActiveView('dashboard')}>← Back to Dashboard</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{availableProjects.length}</div>
            <p className="text-sm text-gray-500">Available Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{availableProjects.filter(p => p.isApplied).length}</div>
            <p className="text-sm text-gray-500">Applications Sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              ₹{availableProjects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">Total Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              ₹{Math.round(availableProjects.reduce((sum, p) => sum + p.budget, 0) / availableProjects.length)}
            </div>
            <p className="text-sm text-gray-500">Avg Budget</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableProjects.map((project) => (
              <div key={project.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg">{project.title}</h4>
                      <Badge variant="default" className="ml-2">₹{project.budget.toLocaleString()}</Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{project.description}</p>
                    <p className="text-sm text-gray-500 mb-2">Client: {project.client}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {project.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">Posted: {project.postedDate}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    disabled={project.isApplied}
                    variant={project.isApplied ? "outline" : "default"}
                  >
                    {project.isApplied ? 'Applied' : 'Apply Now'}
                  </Button>
                  <Button size="sm" variant="outline">View Details</Button>
                  <Button size="sm" variant="ghost">Save</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActiveWorkView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Active Projects</h3>
          <p className="text-gray-600">Manage your current work and deliverables</p>
        </div>
        <Button onClick={() => setActiveView('dashboard')}>← Back to Dashboard</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{myActiveWork.length}</div>
            <p className="text-sm text-gray-500">Active Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              ₹{myActiveWork.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">Total Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(myActiveWork.reduce((sum, p) => sum + p.progress, 0) / myActiveWork.length)}%
            </div>
            <p className="text-sm text-gray-500">Avg Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{mySubmissions.filter(s => s.status === 'Under Review').length}</div>
            <p className="text-sm text-gray-500">Pending Review</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myActiveWork.map((work) => (
              <div key={work.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{work.title}</h4>
                    <p className="text-gray-600">Client: {work.client}</p>
                    <p className="text-gray-600">Budget: ₹{work.budget.toLocaleString()}</p>
                  </div>
                  <Badge variant="default">{work.status}</Badge>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{work.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${work.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                  <span>Due Date: {work.dueDate}</span>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm">Submit Work</Button>
                  <Button size="sm" variant="outline">Update Progress</Button>
                  <Button size="sm" variant="ghost">Message Client</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEarningsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Earnings & Payments</h3>
          <p className="text-gray-600">Track your income and payment history</p>
        </div>
        <Button onClick={() => setActiveView('dashboard')}>← Back to Dashboard</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              ₹{myEarnings.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">Total Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              ₹{myEarnings.filter(e => e.status === 'Pending' || e.status === 'In Escrow').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-500">Pending Payout</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{myEarnings.length}</div>
            <p className="text-sm text-gray-500">Total Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              ${Math.round(myEarnings.reduce((sum, e) => sum + e.amount, 0) / myEarnings.length)}
            </div>
            <p className="text-sm text-gray-500">Avg per Project</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myEarnings.map((earning) => (
              <div key={earning.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div>
                  <h4 className="font-medium">{earning.project}</h4>
                  <p className="text-sm text-gray-600">{earning.date}</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    earning.status === 'Paid' ? 'text-green-600' :
                    earning.status === 'Pending' ? 'text-orange-600' :
                    'text-blue-600'
                  }`}>
                    ${earning.amount.toLocaleString()}
                  </p>
                  <Badge variant={
                    earning.status === 'Paid' ? 'default' :
                    earning.status === 'Pending' ? 'secondary' :
                    'outline'
                  } className="text-xs">
                    {earning.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSubmissionsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Work Submissions</h3>
          <p className="text-gray-600">Track submitted work and client feedback</p>
        </div>
        <Button onClick={() => setActiveView('dashboard')}>← Back to Dashboard</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{mySubmissions.filter(s => s.status === 'Under Review').length}</div>
            <p className="text-sm text-gray-500">Under Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{mySubmissions.filter(s => s.status === 'Approved').length}</div>
            <p className="text-sm text-gray-500">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{mySubmissions.filter(s => s.status === 'Revision Requested').length}</div>
            <p className="text-sm text-gray-500">Need Revision</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{mySubmissions.length}</div>
            <p className="text-sm text-gray-500">Total Submissions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mySubmissions.map((submission) => (
              <div key={submission.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">{submission.title}</h4>
                    <p className="text-gray-600">{submission.project}</p>
                    <p className="text-sm text-gray-500">Submitted: {submission.submittedDate}</p>
                  </div>
                  <Badge variant={
                    submission.status === 'Approved' ? 'default' :
                    submission.status === 'Under Review' ? 'secondary' :
                    'destructive'
                  }>
                    {submission.status}
                  </Badge>
                </div>
                
                {submission.feedback && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Client Feedback:</p>
                    <p className="text-sm text-gray-600">{submission.feedback}</p>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">View Details</Button>
                  {submission.status === 'Revision Requested' && (
                    <Button size="sm">Resubmit</Button>
                  )}
                  {submission.status === 'Under Review' && (
                    <Button size="sm" variant="ghost">Contact Client</Button>
                  )}
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
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Render different views based on activeView state
  if (activeView === 'projects') return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">WorkBridge</h1>
              <Badge variant="secondary">Freelancer Dashboard</Badge>
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

  if (activeView === 'work') return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">WorkBridge</h1>
              <Badge variant="secondary">Freelancer Dashboard</Badge>
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
        {renderActiveWorkView()}
      </main>
    </div>
  );

  if (activeView === 'earnings') return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">WorkBridge</h1>
              <Badge variant="secondary">Freelancer Dashboard</Badge>
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
        {renderEarningsView()}
      </main>
    </div>
  );

  if (activeView === 'submissions') return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">WorkBridge</h1>
              <Badge variant="secondary">Freelancer Dashboard</Badge>
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
        {renderSubmissionsView()}
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
              <Badge variant="secondary">Freelancer Dashboard</Badge>
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
            <h2 className="text-3xl font-bold text-gray-900">Freelancer Dashboard</h2>
            <p className="mt-2 text-gray-600">Find projects, manage your work, and track your earnings</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{myActiveWork.length}</div>
                <p className="text-xs text-gray-500">Currently working on</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${myEarnings.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">Lifetime earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pending Payout</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  ${myEarnings.filter(e => e.status === 'Pending' || e.status === 'In Escrow').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-gray-500">Awaiting release</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((mySubmissions.filter(s => s.status === 'Approved').length / mySubmissions.length) * 100)}%
                </div>
                <p className="text-xs text-gray-500">Approval rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Available Projects Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Available Projects</CardTitle>
                    <CardDescription>New opportunities matching your skills</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setActiveView('projects')}>Browse All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableProjects.slice(0, 2).map((project) => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{project.title}</h4>
                        <Badge variant="default">${project.budget.toLocaleString()}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-1">
                          {project.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                        <Button size="sm" disabled={project.isApplied}>
                          {project.isApplied ? 'Applied' : 'Apply'}
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" className="w-full" onClick={() => setActiveView('projects')}>View All Available Projects</Button>
                </div>
              </CardContent>
            </Card>

            {/* Submitted Work Section */}
            <Card>
              <CardHeader>
                <CardTitle>Submitted Work</CardTitle>
                <CardDescription>Milestones pending client review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mySubmissions.slice(0, 2).map((submission) => (
                    <div key={submission.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{submission.title}</h4>
                        <Badge variant={submission.status === 'Approved' ? 'default' : submission.status === 'Under Review' ? 'secondary' : 'destructive'}>
                          {submission.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{submission.project}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Submitted: {submission.submittedDate}</span>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" className="w-full" onClick={() => setActiveView('submissions')}>View All Submissions</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Active Work Section */}
            <Card>
              <CardHeader>
                <CardTitle>Current Projects</CardTitle>
                <CardDescription>Work in progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myActiveWork.map((work) => (
                    <div key={work.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{work.title}</h4>
                        <Badge variant="default">{work.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Client: {work.client}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${work.progress}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Progress: {work.progress}%</span>
                        <span>Due: {work.dueDate}</span>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" className="w-full" onClick={() => setActiveView('work')}>View All Active Projects</Button>
                </div>
              </CardContent>
            </Card>

            {/* KYC Section */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
                <CardDescription>Complete your profile verification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <h4 className="font-medium">Email Verification</h4>
                        <p className="text-sm text-gray-500">Verified</p>
                      </div>
                    </div>
                    <Badge variant="default">✓</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <h4 className="font-medium">Phone Verification</h4>
                        <p className="text-sm text-gray-500">Verified</p>
                      </div>
                    </div>
                    <Badge variant="default">✓</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div>
                        <h4 className="font-medium">Identity Verification</h4>
                        <p className="text-sm text-gray-500">Pending</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Complete</Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div>
                        <h4 className="font-medium">Payment Setup</h4>
                        <p className="text-sm text-gray-500">Not started</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Setup</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => setActiveView('projects')}>
                  <div className="text-2xl">🔍</div>
                  <span className="text-sm">Browse Projects</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" onClick={() => setActiveView('earnings')}>
                  <div className="text-2xl">📊</div>
                  <span className="text-sm">View Earnings</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <div className="text-2xl">👤</div>
                  <span className="text-sm">Update Profile</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <div className="text-2xl">💬</div>
                  <span className="text-sm">Messages</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}