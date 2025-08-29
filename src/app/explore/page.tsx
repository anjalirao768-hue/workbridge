"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ExploreTalent() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  // Mock freelancer data - in real app, this would come from API
  const freelancers = [
    {
      id: 1,
      name: "Priya Sharma",
      title: "Senior UI/UX Designer",
      avatar: "🎨",
      rating: 4.9,
      reviewCount: 127,
      hourlyRate: "₹2,500",
      completedProjects: 98,
      responseTime: "2 hours",
      location: "Mumbai, India",
      skills: ["Figma", "Adobe XD", "Prototyping", "User Research", "Wireframing"],
      category: "Design & Creative",
      description: "Passionate designer with 5+ years creating intuitive user experiences for startups and enterprises.",
      portfolio: ["Mobile App Design", "E-commerce Platform", "SaaS Dashboard"],
      badges: ["Top Rated", "Rising Talent"],
      languages: ["English", "Hindi", "Marathi"]
    },
    {
      id: 2,
      name: "Rahul Kumar",
      title: "Full Stack Developer",
      avatar: "💻",
      rating: 5.0,
      reviewCount: 89,
      hourlyRate: "₹3,000",
      completedProjects: 156,
      responseTime: "1 hour",
      location: "Bangalore, India",
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
      category: "Tech & Development",
      description: "Expert developer specializing in modern web applications and scalable backend systems.",
      portfolio: ["E-learning Platform", "Fintech Mobile App", "Healthcare Dashboard"],
      badges: ["Top Rated", "Expert Verified"],
      languages: ["English", "Hindi", "Kannada"]
    },
    {
      id: 3,
      name: "Sneha Patel",
      title: "Digital Marketing Strategist",
      avatar: "📈",
      rating: 4.8,
      reviewCount: 203,
      hourlyRate: "₹2,000",
      completedProjects: 142,
      responseTime: "3 hours",
      location: "Ahmedabad, India",
      skills: ["SEO", "Google Ads", "Social Media", "Content Marketing", "Analytics"],
      category: "Marketing & Growth",
      description: "Results-driven marketer helping businesses grow their online presence and drive conversions.",
      portfolio: ["Lead Generation Campaign", "Brand Social Strategy", "SEO Optimization"],
      badges: ["Rising Talent", "Marketing Expert"],
      languages: ["English", "Hindi", "Gujarati"]
    },
    {
      id: 4,
      name: "Arjun Reddy",
      title: "Mobile App Developer",
      avatar: "📱",
      rating: 4.7,
      reviewCount: 76,
      hourlyRate: "₹2,800",
      completedProjects: 67,
      responseTime: "4 hours",
      location: "Hyderabad, India",
      skills: ["Flutter", "React Native", "iOS", "Android", "Firebase"],
      category: "Tech & Development",
      description: "Mobile development specialist creating cross-platform apps for diverse industries.",
      portfolio: ["Food Delivery App", "Fitness Tracking App", "Business Management App"],
      badges: ["Mobile Expert"],
      languages: ["English", "Hindi", "Telugu"]
    },
    {
      id: 5,
      name: "Aisha Khan",
      title: "Content Writer & Copywriter",
      avatar: "✍️",
      rating: 4.9,
      reviewCount: 154,
      hourlyRate: "₹1,500",
      completedProjects: 234,
      responseTime: "2 hours",
      location: "Delhi, India",
      skills: ["Content Writing", "Copywriting", "SEO Writing", "Blog Writing", "Technical Writing"],
      category: "Writing & Translation",
      description: "Creative writer crafting compelling content that engages audiences and drives results.",
      portfolio: ["Blog Content Series", "Website Copy", "Email Marketing Campaigns"],
      badges: ["Top Rated", "Content Expert"],
      languages: ["English", "Hindi", "Urdu"]
    },
    {
      id: 6,
      name: "Vikram Singh",
      title: "Financial Consultant & Analyst",
      avatar: "📊",
      rating: 4.6,
      reviewCount: 92,
      hourlyRate: "₹3,500",
      completedProjects: 78,
      responseTime: "6 hours",
      location: "Pune, India",
      skills: ["Financial Modeling", "Investment Analysis", "Risk Assessment", "Excel", "PowerBI"],
      category: "Finance & Consulting",
      description: "Experienced financial professional providing strategic insights and data-driven solutions.",
      portfolio: ["Investment Portfolio Analysis", "Financial Dashboard", "Risk Assessment Report"],
      badges: ["Finance Expert", "Verified Professional"],
      languages: ["English", "Hindi", "Punjabi"]
    }
  ];

  const categories = ["All", "Design & Creative", "Tech & Development", "Marketing & Growth", "Writing & Translation", "Finance & Consulting"];

  const filteredFreelancers = freelancers.filter(freelancer => {
    const matchesCategory = selectedCategory === "All" || freelancer.category === selectedCategory;
    const matchesSearch = freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         freelancer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         freelancer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedFreelancers = [...filteredFreelancers].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "price-low":
        return parseInt(a.hourlyRate.replace(/[^\d]/g, '')) - parseInt(b.hourlyRate.replace(/[^\d]/g, ''));
      case "price-high":
        return parseInt(b.hourlyRate.replace(/[^\d]/g, '')) - parseInt(a.hourlyRate.replace(/[^\d]/g, ''));
      case "projects":
        return b.completedProjects - a.completedProjects;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <span className="text-gray-900 font-bold text-xl">WorkBridge</span>
              </Link>
            </div>
            <div className="flex space-x-4">
              <Button asChild variant="ghost">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Amazing <span className="text-blue-200">Talent</span>
          </h1>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Browse through our curated collection of verified freelancers ready to bring your projects to life.
          </p>
          <div className="flex justify-center items-center space-x-8 text-center">
            <div>
              <div className="text-3xl font-bold">{freelancers.length}+</div>
              <div className="text-purple-200">Verified Experts</div>
            </div>
            <div>
              <div className="text-3xl font-bold">4.8</div>
              <div className="text-purple-200">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold">1,200+</div>
              <div className="text-purple-200">Projects Completed</div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search by name, skills, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="projects">Most Projects</option>
            </select>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {sortedFreelancers.length} Freelancer{sortedFreelancers.length !== 1 ? 's' : ''} Found
          </h2>
          <div className="text-gray-600">
            {selectedCategory !== "All" && (
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                {selectedCategory}
              </span>
            )}
          </div>
        </div>

        {/* Freelancer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedFreelancers.map((freelancer) => (
            <Card key={freelancer.id} className="hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-purple-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-2xl">
                      {freelancer.avatar}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-gray-900">{freelancer.name}</CardTitle>
                      <p className="text-gray-600 text-sm">{freelancer.title}</p>
                      <p className="text-gray-500 text-xs">{freelancer.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-bold">{freelancer.rating}</span>
                      <span className="text-gray-500 text-sm">({freelancer.reviewCount})</span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {freelancer.badges.map((badge, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Description */}
                <p className="text-gray-700 text-sm leading-relaxed">
                  {freelancer.description}
                </p>

                {/* Skills */}
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Top Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {freelancer.skills.slice(0, 4).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {freelancer.skills.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{freelancer.skills.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="font-bold text-purple-600">{freelancer.completedProjects}</div>
                    <div className="text-gray-500">Projects</div>
                  </div>
                  <div>
                    <div className="font-bold text-green-600">{freelancer.hourlyRate}/hr</div>
                    <div className="text-gray-500">Rate</div>
                  </div>
                  <div>
                    <div className="font-bold text-blue-600">{freelancer.responseTime}</div>
                    <div className="text-gray-500">Response</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4">
                  <Button asChild className="flex-1 bg-purple-600 hover:bg-purple-700">
                    <Link href="/signup">View Profile</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1 border-purple-600 text-purple-600 hover:bg-purple-50">
                    <Link href="/signup">Contact</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg" className="border-purple-600 text-purple-600 hover:bg-purple-50">
            <Link href="/signup">Load More Freelancers</Link>
          </Button>
        </div>
      </div>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of clients who have found their perfect freelancer match on WorkBridge.
          </p>
          <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-3">
            <Link href="/signup">Post Your Project</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}