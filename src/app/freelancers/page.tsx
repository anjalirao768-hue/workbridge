"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Freelancers() {
  const freelancers = [
    {
      id: 1,
      name: "Priya Sharma",
      title: "Full Stack Developer",
      avatar: "PS",
      rating: 4.9,
      reviewCount: 127,
      hourlyRate: 2500,
      skills: ["React", "Node.js", "TypeScript", "MongoDB"],
      description: "Experienced full-stack developer specializing in modern web applications with 5+ years of experience.",
      location: "Mumbai, India",
      completedJobs: 89
    },
    {
      id: 2,
      name: "Rahul Kumar",
      title: "UI/UX Designer",
      avatar: "RK",
      rating: 4.8,
      reviewCount: 95,
      hourlyRate: 2000,
      skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
      description: "Creative designer focused on user-centered design with expertise in mobile and web applications.",
      location: "Bangalore, India",
      completedJobs: 67
    },
    {
      id: 3,
      name: "Sneha Patel",
      title: "Digital Marketing Specialist",
      avatar: "SP",
      rating: 5.0,
      reviewCount: 78,
      hourlyRate: 1800,
      skills: ["SEO", "Google Ads", "Social Media", "Analytics"],
      description: "Results-driven digital marketer with proven track record of increasing online visibility and ROI.",
      location: "Delhi, India",
      completedJobs: 54
    },
    {
      id: 4,
      name: "Arjun Singh",
      title: "Mobile App Developer",
      avatar: "AS",
      rating: 4.7,
      reviewCount: 112,
      hourlyRate: 2800,
      skills: ["React Native", "Flutter", "iOS", "Android"],
      description: "Mobile app developer with expertise in cross-platform development and native app optimization.",
      location: "Pune, India",
      completedJobs: 73
    },
    {
      id: 5,
      name: "Kavya Reddy",
      title: "Content Writer",
      avatar: "KR",
      rating: 4.9,
      reviewCount: 156,
      hourlyRate: 1200,
      skills: ["Technical Writing", "SEO Content", "Copywriting", "Blog Writing"],
      description: "Professional content writer specializing in technical documentation and SEO-optimized content.",
      location: "Hyderabad, India",
      completedJobs: 98
    },
    {
      id: 6,
      name: "Vikram Joshi",
      title: "DevOps Engineer",
      avatar: "VJ",
      rating: 4.8,
      reviewCount: 89,
      hourlyRate: 3200,
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
      description: "DevOps expert with experience in cloud infrastructure, automation, and scalable deployments.",
      location: "Chennai, India",
      completedJobs: 61
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
              <Button asChild variant="ghost" className="text-green-600 hover:text-green-700 font-medium">
                <Link href="/freelancers">Find Talent</Link>
              </Button>
              <Button asChild variant="ghost" className="text-gray-600 hover:text-gray-900 font-medium">
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
              Find the Perfect Freelancer
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover talented professionals ready to bring your projects to life
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search for skills, services, or freelancers..."
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

      {/* Freelancers Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {freelancers.length} freelancers available
            </h2>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <option>Best Match</option>
              <option>Highest Rated</option>
              <option>Most Reviews</option>
              <option>Lowest Price</option>
              <option>Highest Price</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freelancers.map((freelancer) => (
              <Card key={freelancer.id} className="hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-green-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{freelancer.avatar}</span>
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900">{freelancer.name}</CardTitle>
                        <p className="text-green-600 font-medium">{freelancer.title}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-medium">{freelancer.rating}</span>
                      <span>({freelancer.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>📍</span>
                      <span>{freelancer.location}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                    {freelancer.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {freelancer.skills.slice(0, 4).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xl font-bold text-gray-900">₹{freelancer.hourlyRate.toLocaleString()}/hr</div>
                      <div className="text-sm text-gray-600">{freelancer.completedJobs} jobs completed</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                      Contact
                    </Button>
                    <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="border-green-600 text-green-600 hover:bg-green-50">
              Load More Freelancers
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}