"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { projectsStore } from "@/lib/projects-store";

export default function PostProjectTest() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    budgetType: 'fixed', // 'fixed' or 'hourly'
    duration: '',
    skills: ''
  });
  
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const router = useRouter();

  const skillSuggestions = [
    'React', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 
    'UI/UX Design', 'Figma', 'MongoDB', 'PostgreSQL'
  ];

  const categories = [
    'Web Development',
    'Mobile Development', 
    'UI/UX Design',
    'Digital Marketing',
    'Content Writing'
  ];

  const handleSkillAdd = (skill: string) => {
    if (!selectedSkills.includes(skill) && selectedSkills.length < 10) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSkillRemove = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    // Basic validation
    if (!formData.title.trim()) {
      setSubmitStatus('❌ Project title is required');
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.description.trim()) {
      setSubmitStatus('❌ Description is required');
      setIsSubmitting(false);
      return;
    }

    if (!formData.budget || parseFloat(formData.budget) < 1000) {
      setSubmitStatus('❌ Budget must be at least ₹1,000');
      setIsSubmitting(false);
      return;
    }

    try {
      // Create the project using the store
      const newProject = projectsStore.addProject({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category || 'Web Development',
        client: 'Test Client',
        clientId: 'test_client_id',
        budget: parseFloat(formData.budget),
        budgetType: formData.budgetType as 'fixed' | 'hourly',
        duration: formData.duration || 'To be discussed',
        experienceLevel: 'intermediate',
        skills: selectedSkills.length > 0 ? selectedSkills : ['Web Development'],
        status: 'open'
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitStatus(`✅ Project "${newProject.title}" posted successfully! ID: ${newProject.id}`);
      
      // Reset form
      setTimeout(() => {
        setFormData({
          title: '',
          description: '',
          category: '',
          budget: '',
          budgetType: 'fixed',
          duration: '',
          skills: ''
        });
        setSelectedSkills([]);
        setSubmitStatus('');
      }, 3000);
      
    } catch {
      setSubmitStatus('❌ Failed to post project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">WorkBridge</h1>
              <Badge variant="secondary">Test Project Posting</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => router.push('/')} variant="ghost" size="sm">
                ← Back to Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Test: Post a New Project</h2>
            <p className="mt-2 text-gray-600">Test the project posting functionality</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Basics */}
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
                <CardDescription>Basic project details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g., Modern E-commerce Website Development"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="mt-1"
                    maxLength={100}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Project Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="description">Project Description *</Label>
                  <textarea
                    id="description"
                    placeholder="Describe your project..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Budget */}
            <Card>
              <CardHeader>
                <CardTitle>Budget</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="budget">Project Budget (₹) *</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="50000"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      className="pl-8"
                      min="1000"
                      step="100"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Selected Skills ({selectedSkills.length}/10)</Label>
                  <div className="flex flex-wrap gap-2 mt-2 min-h-[2.5rem] p-2 border border-gray-300 rounded-md">
                    {selectedSkills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="flex items-center space-x-1">
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleSkillRemove(skill)}
                          className="ml-1 text-gray-500 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                    {selectedSkills.length === 0 && (
                      <span className="text-gray-500 text-sm">No skills selected yet</span>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Available Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skillSuggestions.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleSkillAdd(skill)}
                        disabled={selectedSkills.includes(skill)}
                        className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                          selectedSkills.includes(skill)
                            ? 'bg-purple-100 text-purple-800 border-purple-300 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-300'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <Card>
              <CardContent className="pt-6">
                {submitStatus && (
                  <div className={`p-3 rounded-md text-sm mb-4 ${
                    submitStatus.includes('✅') 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {submitStatus}
                  </div>
                )}
                
                <div className="flex justify-end space-x-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isSubmitting ? 'Posting Project...' : 'Post Project'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </main>
    </div>
  );
}