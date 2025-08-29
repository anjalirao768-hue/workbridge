"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { projectsStore } from "@/lib/projects-store";

export default function PostProject() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    budgetType: 'fixed', // 'fixed' or 'hourly'
    duration: '',
    experienceLevel: 'intermediate',
    skills: '',
    applicationDeadline: '',
    specialRequirements: ''
  });
  
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user/me');
        if (res.ok) {
          const userData = await res.json();
          if (userData.role === 'client') {
            setIsAuthenticated(true);
          } else {
            router.push('/home');
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  const skillSuggestions = [
    'React', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'Java', 'PHP', 'Ruby',
    'Vue.js', 'Angular', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'Laravel',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST API',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'CI/CD', 'DevOps',
    'UI/UX Design', 'Figma', 'Adobe XD', 'Photoshop', 'Illustrator',
    'Content Writing', 'SEO', 'Digital Marketing', 'Social Media Marketing',
    'Data Science', 'Machine Learning', 'AI', 'Data Analysis', 'Tableau',
    'Mobile Development', 'React Native', 'Flutter', 'iOS', 'Android'
  ];

  const categories = [
    'Web Development',
    'Mobile Development', 
    'UI/UX Design',
    'Digital Marketing',
    'Content Writing',
    'Data Science',
    'DevOps & Cloud',
    'E-commerce',
    'Consulting',
    'Other'
  ];

  const handleSkillAdd = (skill: string) => {
    if (!selectedSkills.includes(skill) && selectedSkills.length < 10) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSkillRemove = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const handleCustomSkillAdd = () => {
    const customSkill = formData.skills.trim();
    if (customSkill && !selectedSkills.includes(customSkill) && selectedSkills.length < 10) {
      setSelectedSkills([...selectedSkills, customSkill]);
      setFormData({...formData, skills: ''});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    // Validation
    if (!formData.title.trim()) {
      setSubmitStatus('❌ Project title is required');
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.description.trim() || formData.description.trim().length < 50) {
      setSubmitStatus('❌ Description must be at least 50 characters');
      setIsSubmitting(false);
      return;
    }

    if (!formData.budget || parseFloat(formData.budget) < 1000) {
      setSubmitStatus('❌ Budget must be at least ₹1,000');
      setIsSubmitting(false);
      return;
    }

    if (selectedSkills.length === 0) {
      setSubmitStatus('❌ Please select at least one required skill');
      setIsSubmitting(false);
      return;
    }

    try {
      // Create the project using the store
      const newProject = projectsStore.addProject({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        client: 'Current User', // In real app, get from auth context
        clientId: 'current_user_id', // In real app, get from auth context
        budget: parseFloat(formData.budget),
        budgetType: formData.budgetType as 'fixed' | 'hourly',
        duration: formData.duration || 'To be discussed',
        experienceLevel: formData.experienceLevel as 'entry' | 'intermediate' | 'expert',
        skills: selectedSkills,
        status: 'open',
        applicationDeadline: formData.applicationDeadline || undefined,
        specialRequirements: formData.specialRequirements.trim() || undefined,
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitStatus(`✅ Project "${newProject.title}" posted successfully! Redirecting to your dashboard...`);
      
      // Redirect to dashboard after success
      setTimeout(() => {
        router.push('/dashboard/client?refresh=true');
      }, 2000);
      
    } catch {
      setSubmitStatus('❌ Failed to post project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">WorkBridge</h1>
              <Badge variant="secondary">Post New Project</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => router.push('/dashboard/client')} variant="ghost" size="sm">
                ← Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Post a New Project</h2>
            <p className="mt-2 text-gray-600">Share your project details and connect with talented freelancers</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Basics */}
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
                <CardDescription>Tell us about your project</CardDescription>
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
                  <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
                </div>

                <div>
                  <Label htmlFor="category">Project Category *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
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
                    placeholder="Describe your project in detail. Include objectives, requirements, deliverables, and any specific preferences..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows={6}
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.description.length}/2000 characters (minimum 50)</p>
                </div>
              </CardContent>
            </Card>

            {/* Budget & Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Budget & Timeline</CardTitle>
                <CardDescription>Set your project budget and timeline</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Budget Type *</Label>
                  <div className="flex space-x-4 mt-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="budgetType"
                        value="fixed"
                        checked={formData.budgetType === 'fixed'}
                        onChange={(e) => setFormData({...formData, budgetType: e.target.value})}
                        className="mr-2"
                      />
                      Fixed Price Project
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="budgetType"
                        value="hourly"
                        checked={formData.budgetType === 'hourly'}
                        onChange={(e) => setFormData({...formData, budgetType: e.target.value})}
                        className="mr-2"
                      />
                      Hourly Rate
                    </label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="budget">
                    {formData.budgetType === 'fixed' ? 'Project Budget (₹) *' : 'Hourly Rate Range (₹) *'}
                  </Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <Input
                      id="budget"
                      type="number"
                      placeholder={formData.budgetType === 'fixed' ? "50000" : "2500"}
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      className="pl-8"
                      min="1000"
                      step="100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.budgetType === 'fixed' 
                      ? 'Total project budget in Indian Rupees' 
                      : 'Expected hourly rate range'
                    }
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Project Duration</Label>
                    <select
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Select duration</option>
                      <option value="1-2 weeks">1-2 weeks</option>
                      <option value="3-4 weeks">3-4 weeks</option>
                      <option value="1-2 months">1-2 months</option>
                      <option value="3-6 months">3-6 months</option>
                      <option value="6+ months">6+ months</option>
                      <option value="ongoing">Ongoing</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="experienceLevel">Experience Level Required</Label>
                    <select
                      id="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="entry">Entry Level (0-2 years)</option>
                      <option value="intermediate">Intermediate (2-5 years)</option>
                      <option value="expert">Expert (5+ years)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="applicationDeadline">Application Deadline</Label>
                  <Input
                    id="applicationDeadline"
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => setFormData({...formData, applicationDeadline: e.target.value})}
                    className="mt-1"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional: Set a deadline for applications</p>
                </div>
              </CardContent>
            </Card>

            {/* Skills & Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Required Skills & Expertise</CardTitle>
                <CardDescription>Select skills that freelancers should have for this project</CardDescription>
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
                  <Label>Add Custom Skill</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      type="text"
                      placeholder="Type a skill and press Add"
                      value={formData.skills}
                      onChange={(e) => setFormData({...formData, skills: e.target.value})}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleCustomSkillAdd())}
                    />
                    <Button type="button" onClick={handleCustomSkillAdd} variant="outline">
                      Add
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Popular Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skillSuggestions.slice(0, 20).map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleSkillAdd(skill)}
                        disabled={selectedSkills.includes(skill) || selectedSkills.length >= 10}
                        className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                          selectedSkills.includes(skill)
                            ? 'bg-purple-100 text-purple-800 border-purple-300 cursor-not-allowed'
                            : selectedSkills.length >= 10
                            ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-300'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialRequirements">Special Requirements</Label>
                  <textarea
                    id="specialRequirements"
                    placeholder="Any specific requirements, preferences, or additional details..."
                    value={formData.specialRequirements}
                    onChange={(e) => setFormData({...formData, specialRequirements: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.specialRequirements.length}/500 characters</p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Section */}
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
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p>By posting this project, you agree to WorkBridge&apos;s terms of service.</p>
                    <p className="mt-1">Your project will be visible to verified freelancers immediately.</p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/dashboard/client')}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isSubmitting ? 'Posting Project...' : 'Post Project'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </main>
    </div>
  );
}