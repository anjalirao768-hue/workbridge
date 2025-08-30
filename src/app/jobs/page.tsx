"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Jobs() {
  const jobs = [
    {
      id: 1,
      title: "Build a Modern E-commerce Website",
      description: "Looking for an experienced developer to build a full-featured e-commerce platform with React, Node.js, and payment integration. The project includes user authentication, product catalog, shopping cart, and admin panel.",
      budget: "₹80,000 - ₹1,20,000",
      budgetType: "Fixed Price",
      duration: "2-3 months",
      skills: ["React", "Node.js", "MongoDB", "Payment Gateway"],
      postedTime: "2 hours ago",
      proposalsCount: 8,
      client: {
        name: "TechStart Solutions",
        rating: 4.8,
        jobsPosted: 12,
        location: "Mumbai, India"
      },
      experienceLevel: "Intermediate"
    },
    {
      id: 2,
      title: "Mobile App UI/UX Design",
      description: "Need a talented designer to create modern, user-friendly interfaces for our fitness tracking mobile app. Looking for clean designs with smooth user experience for both iOS and Android platforms.",
      budget: "₹25,000 - ₹40,000",
      budgetType: "Fixed Price",
      duration: "3-4 weeks",
      skills: ["Figma", "Mobile UI", "User Research", "Prototyping"],
      postedTime: "5 hours ago",
      proposalsCount: 15,
      client: {
        name: "FitLife Technologies",
        rating: 4.9,
        jobsPosted: 7,
        location: "Bangalore, India"
      },
      experienceLevel: "Intermediate"
    },
    {
      id: 3,
      title: "Digital Marketing Campaign Setup",
      description: "Seeking a digital marketing expert to set up and manage Google Ads campaigns for our SaaS product. Experience with B2B marketing and lead generation required.",
      budget: "₹15,000 - ₹25,000",
      budgetType: "Fixed Price", 
      duration: "1-2 months",
      skills: ["Google Ads", "SEO", "Lead Generation", "Analytics"],
      postedTime: "1 day ago",
      proposalsCount: 23,
      client: {
        name: "CloudSync Systems",
        rating: 4.7,
        jobsPosted: 19,
        location: "Delhi, India"
      },
      experienceLevel: "Expert"
    },
    {
      id: 4,
      title: "Content Writing for Tech Blog",
      description: "Looking for a skilled content writer to create engaging blog posts about emerging technologies, software development trends, and industry insights. Must have technical writing experience.",
      budget: "₹500 - ₹800/article",
      budgetType: "Per Article",
      duration: "Ongoing",
      skills: ["Technical Writing", "SEO Content", "Research", "Technology"],
      postedTime: "2 days ago", 
      proposalsCount: 31,
      client: {
        name: "TechInsights Media",
        rating: 4.6,
        jobsPosted: 45,
        location: "Pune, India"
      },
      experienceLevel: "Intermediate"
    },
    {
      id: 5,
      title: "DevOps Infrastructure Setup",
      description: "Need a DevOps engineer to set up CI/CD pipelines, configure AWS infrastructure, and implement monitoring solutions for our web application. Docker and Kubernetes experience required.",
      budget: "₹60,000 - ₹90,000",
      budgetType: "Fixed Price",
      duration: "4-6 weeks",
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
      postedTime: "3 days ago",
      proposalsCount: 12,
      client: {
        name: "DataFlow Solutions",
        rating: 5.0,
        jobsPosted: 8,
        location: "Hyderabad, India"
      },
      experienceLevel: "Expert"
    },
    {
      id: 6,
      title: "WordPress Website Development",
      description: "Require a WordPress developer to create a business website with custom theme, contact forms, and basic SEO optimization. Must be responsive and mobile-friendly.",
      budget: "₹20,000 - ₹35,000",
      budgetType: "Fixed Price",
      duration: "2-3 weeks",
      skills: ["WordPress", "PHP", "CSS", "Responsive Design"],
      postedTime: "4 days ago",
      proposalsCount: 27,
      client: {
        name: "Local Business Hub",
        rating: 4.5,
        jobsPosted: 5,
        location: "Chennai, India"
      },
      experienceLevel: "Entry Level"
    }
  ];

  const categories = [
    "All Categories",
    "Development & IT",
    "Design & Creative",
    "Sales & Marketing", 
    "Writing & Translation",
    "Admin & Customer Support",
    "Finance & Accounting"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-gray-900 font-bold text-xl">WorkBridge</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Button asChild variant="ghost" className="text-gray-600 hover:text-gray-900 font-medium">
                <Link href="/freelancers">Find Talent</Link>
              </Button>
              <Button asChild variant="ghost" className="text-green-600 hover:text-green-700 font-medium">
                <Link href="/jobs">Find Work</Link>
              </Button>
              <Button asChild variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Find Your Next Opportunity
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover projects that match your skills and grow your freelance career
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search for jobs, skills, or keywords..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={index === 0 ? "default" : "outline"}
                size="sm"
                className={index === 0 ? "bg-green-600 hover:bg-green-700" : "border-gray-300 text-gray-700 hover:border-green-600 hover:text-green-600"}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {jobs.length} jobs found
            </h2>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <option>Most Recent</option>
              <option>Highest Budget</option>
              <option>Lowest Budget</option>
              <option>Fewest Proposals</option>
              <option>Most Proposals</option>
            </select>
          </div>

          <div className="space-y-6">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-green-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-900 mb-2">{job.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span className="font-medium text-green-600">{job.budget}</span>
                        <span>•</span>
                        <span>{job.budgetType}</span>
                        <span>•</span>
                        <span>{job.duration}</span>
                        <span>•</span>
                        <Badge variant="outline" className="border-gray-300 text-gray-700">
                          {job.experienceLevel}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <div>{job.postedTime}</div>
                      <div>{job.proposalsCount} proposals</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {job.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <span>🏢</span>
                        <span className="font-medium">{job.client.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">⭐</span>
                        <span>{job.client.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>📍</span>
                        <span>{job.client.location}</span>
                      </div>
                      <div>
                        <span>{job.client.jobsPosted} jobs posted</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                        Save Job
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="border-green-600 text-green-600 hover:bg-green-50">
              Load More Jobs
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}