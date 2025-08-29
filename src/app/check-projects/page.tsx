"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { projectsStore, type ProjectData } from "@/lib/projects-store";
import { useRouter } from "next/navigation";

export default function CheckProjects() {
  const [allProjects, setAllProjects] = useState<ProjectData[]>([]);
  const [clientProjects, setClientProjects] = useState<ProjectData[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Get all projects from store
    const projects = projectsStore.getAllProjects();
    setAllProjects(projects);

    // Get client-specific projects
    const currentClientId = 'current_client_id';
    const clientSpecific = projectsStore.getProjectsByClient(currentClientId);
    setClientProjects(clientSpecific);
  }, []);

  const refreshProjects = () => {
    const projects = projectsStore.getAllProjects();
    setAllProjects(projects);
    
    const currentClientId = 'current_client_id';
    const clientSpecific = projectsStore.getProjectsByClient(currentClientId);
    setClientProjects(clientSpecific);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects Store Debug</h1>
            <p className="text-gray-600">Check if posted projects appear in the store</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={refreshProjects} variant="outline">Refresh Projects</Button>
            <Button onClick={() => router.push('/post-project-test')} variant="outline">Post New Project</Button>
            <Button onClick={() => router.push('/')} variant="ghost">← Home</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{allProjects.length}</div>
              <p className="text-sm text-gray-500">Total Projects in Store</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{clientProjects.length}</div>
              <p className="text-sm text-gray-500">Current Client Projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                ₹{allProjects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}
              </div>
              <p className="text-sm text-gray-500">Total Project Value</p>
            </CardContent>
          </Card>
        </div>

        {/* All Projects */}
        <Card>
          <CardHeader>
            <CardTitle>All Projects in Store ({allProjects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {allProjects.length === 0 ? (
              <p className="text-gray-500">No projects found in store</p>
            ) : (
              <div className="space-y-4">
                {allProjects.map((project) => (
                  <div key={project.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{project.title}</h4>
                        <p className="text-gray-600">by {project.client}</p>
                        <p className="text-sm text-gray-500">Client ID: {project.clientId}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">₹{project.budget.toLocaleString()}</Badge>
                        <p className="text-xs text-gray-500 mt-1">Posted: {project.postedDate}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {project.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Status: {project.status}</span>
                      <span>Applications: {project.applicationsCount} | Views: {project.viewsCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Specific Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Current Client Projects ({clientProjects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {clientProjects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No projects found for current client</p>
                <Button onClick={() => router.push('/post-project-test')} className="mt-4">
                  Post Your First Project
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {clientProjects.map((project) => (
                  <div key={project.id} className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-lg text-blue-900">{project.title}</h4>
                        <p className="text-blue-700">Your Project</p>
                        <p className="text-sm text-blue-600">ID: {project.id}</p>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        ₹{project.budget.toLocaleString()}
                      </Badge>
                    </div>
                    <p className="text-blue-800 text-sm mb-2">{project.description}</p>
                    <div className="flex justify-between text-xs text-blue-600">
                      <span>Posted: {project.postedDate}</span>
                      <span>Applications: {project.applicationsCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}