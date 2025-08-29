// Simple in-memory store for projects - In production, this would be a database/API
interface ProjectData {
  id: string;
  title: string;
  description: string;
  category: string;
  client: string;
  clientId: string;
  budget: number;
  budgetType: 'fixed' | 'hourly';
  duration: string;
  experienceLevel: 'entry' | 'intermediate' | 'expert';
  skills: string[];
  status: 'open' | 'in-review' | 'hired' | 'closed';
  postedDate: string;
  applicationDeadline?: string;
  specialRequirements?: string;
  applicationsCount: number;
  viewsCount: number;
}

class ProjectsStore {
  private projects: ProjectData[] = [
    // Initial mock projects
    {
      id: '1',
      title: 'React Dashboard Development',
      description: 'Build an admin dashboard with React and TypeScript for data visualization.',
      category: 'Web Development',
      client: 'TechCorp Inc.',
      clientId: 'client1',
      budget: 290500,
      budgetType: 'fixed',
      duration: '6-8 weeks',
      experienceLevel: 'intermediate',
      skills: ['React', 'TypeScript', 'Dashboard'],
      status: 'open',
      postedDate: '2023-12-08',
      applicationsCount: 5,
      viewsCount: 23,
    },
    {
      id: '2',
      title: 'E-commerce API Integration',
      description: 'Integrate third-party APIs with existing Node.js backend system.',
      category: 'Web Development',
      client: 'ShopSmart Ltd.',
      clientId: 'client2',
      budget: 182600,
      budgetType: 'fixed',
      duration: '4-5 weeks',
      experienceLevel: 'intermediate',
      skills: ['Node.js', 'API', 'Backend'],
      status: 'open',
      postedDate: '2023-12-07',
      applicationsCount: 8,
      viewsCount: 45,
    },
    {
      id: '3',
      title: 'Mobile App UI Design',
      description: 'Design modern and intuitive UI for iOS and Android mobile application.',
      category: 'UI/UX Design',
      client: 'StartupXYZ',
      clientId: 'client3',
      budget: 149400,
      budgetType: 'fixed',
      duration: '3-4 weeks',
      experienceLevel: 'intermediate',
      skills: ['UI/UX', 'Figma', 'Mobile'],
      status: 'open',
      postedDate: '2023-12-06',
      applicationsCount: 12,
      viewsCount: 67,
    },
    {
      id: '4',
      title: 'WordPress Website Development',
      description: 'Create a professional business website using WordPress with custom theme.',
      category: 'Web Development',
      client: 'LocalBiz Co.',
      clientId: 'client4',
      budget: 124500,
      budgetType: 'fixed',
      duration: '2-3 weeks',
      experienceLevel: 'entry',
      skills: ['WordPress', 'PHP', 'CSS'],
      status: 'open',
      postedDate: '2023-12-05',
      applicationsCount: 3,
      viewsCount: 18,
    },
    {
      id: '5',
      title: 'Data Analysis & Visualization',
      description: 'Analyze large datasets and create interactive visualizations and reports.',
      category: 'Data Science',
      client: 'Analytics Pro',
      clientId: 'client5',
      budget: 232400,
      budgetType: 'fixed',
      duration: '5-6 weeks',
      experienceLevel: 'expert',
      skills: ['Python', 'Data Science', 'Visualization'],
      status: 'open',
      postedDate: '2023-12-04',
      applicationsCount: 7,
      viewsCount: 34,
    }
  ];

  getAllProjects(): ProjectData[] {
    return this.projects;
  }

  getProjectsByClient(clientId: string): ProjectData[] {
    return this.projects.filter(p => p.clientId === clientId);
  }

  addProject(projectData: Omit<ProjectData, 'id' | 'postedDate' | 'applicationsCount' | 'viewsCount'>): ProjectData {
    const newProject: ProjectData = {
      ...projectData,
      id: `project_${Date.now()}`,
      postedDate: new Date().toISOString().split('T')[0],
      applicationsCount: 0,
      viewsCount: 0,
    };
    
    this.projects.unshift(newProject); // Add to beginning
    return newProject;
  }

  getProjectById(id: string): ProjectData | undefined {
    return this.projects.find(p => p.id === id);
  }

  updateProject(id: string, updates: Partial<ProjectData>): ProjectData | null {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    this.projects[index] = { ...this.projects[index], ...updates };
    return this.projects[index];
  }

  incrementViews(id: string): void {
    const project = this.getProjectById(id);
    if (project) {
      project.viewsCount++;
    }
  }

  incrementApplications(id: string): void {
    const project = this.getProjectById(id);
    if (project) {
      project.applicationsCount++;
    }
  }
}

// Export singleton instance
export const projectsStore = new ProjectsStore();
export type { ProjectData };