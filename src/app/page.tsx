"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const categories = [
    { 
      name: "Development & IT", 
      icon: "💻", 
      description: "Web, mobile, and software development",
      jobs: "2,847 projects"
    },
    { 
      name: "Design & Creative", 
      icon: "🎨", 
      description: "UI/UX, graphic design, and branding",
      jobs: "1,923 projects"
    },
    { 
      name: "Sales & Marketing", 
      icon: "📈", 
      description: "Digital marketing and growth strategies",
      jobs: "1,456 projects"
    },
    { 
      name: "Writing & Translation", 
      icon: "✍️", 
      description: "Content creation and language services",
      jobs: "987 projects"
    },
    { 
      name: "Admin & Support", 
      icon: "🎧", 
      description: "Virtual assistance and customer support",
      jobs: "756 projects"
    },
    { 
      name: "Finance & Accounting", 
      icon: "💰", 
      description: "Financial planning and bookkeeping",
      jobs: "543 projects"
    }
  ];

  const features = [
    {
      icon: "🌍",
      title: "Global Talent",
      description: "Access skilled professionals from around the world, available in your timezone."
    },
    {
      icon: "🤖",
      title: "AI Matching",
      description: "Our smart algorithms connect you with the perfect freelancer for your project."
    },
    {
      icon: "⭐",
      title: "24/7 Support", 
      description: "Round-the-clock assistance to ensure your projects run smoothly."
    }
  ];

  const testimonials = [
    {
      quote: "WorkBridge helped me find amazing clients and grow my freelance business beyond expectations.",
      author: "Priya Sharma",
      role: "Full Stack Developer",
      avatar: "PS"
    },
    {
      quote: "The quality of talent on WorkBridge is exceptional. Found the perfect team for our startup.",
      author: "Michael Chen",
      role: "Startup Founder",
      avatar: "MC"
    },
    {
      quote: "Simple, efficient, and results-driven. WorkBridge makes collaboration effortless.",
      author: "Sarah Wilson",
      role: "Marketing Director", 
      avatar: "SW"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="text-white font-bold text-xl">WorkBridge</span>
            </Link>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-8">
              <Button asChild variant="ghost" className="text-white hover:text-purple-200 font-medium">
                <Link href="/freelancers">Find Talent</Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:text-purple-200 font-medium">
                <Link href="/jobs">Find Work</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-6 py-2 rounded-full shadow-lg">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>

            {/* Mobile menu */}
            <div className="md:hidden">
              <Button asChild size="sm" className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-full">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Background Image */}
      <section 
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://customer-assets.emergentagent.com/job_talent-escrow-1/artifacts/ohfk7u7w_ChatGPT%20Image%20Aug%2030%2C%202025%2C%2011_10_37%20AM.png')`
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 via-blue-900/70 to-purple-900/80"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Work Without Limits
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Find top talent or discover opportunities to grow your career.
          </p>
          
          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white text-lg px-10 py-4 rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105">
              <Link href="/freelancers">Find Talent</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-purple-600 text-lg px-10 py-4 rounded-full backdrop-blur-md bg-white/10 transition-all duration-300">
              <Link href="/jobs">Find Work</Link>
            </Button>
            <Button asChild size="lg" className="bg-white/20 border border-white/30 text-white hover:bg-white hover:text-purple-600 text-lg px-10 py-4 rounded-full backdrop-blur-md transition-all duration-300">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center text-white/80">
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-white">50K+</span>
              <span>Active Professionals</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-white/50 rounded-full"></div>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-white">10K+</span>
              <span>Projects Completed</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-white/50 rounded-full"></div>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-white">99%</span>
              <span>Success Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Explore Top Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover talented professionals across all industries and skill sets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Link key={index} href="/jobs" className="group">
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg group-hover:scale-105 bg-white">
                  <CardHeader className="text-center pb-4">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </div>
                    <CardTitle className="text-xl text-gray-900 group-hover:text-purple-600 transition-colors">
                      {category.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 text-center">
                    <p className="text-sm font-medium text-purple-600">{category.jobs}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why WorkBridge Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose WorkBridge
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to succeed in the modern work economy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader>
                  <div className="text-5xl mb-6">{feature.icon}</div>
                  <CardTitle className="text-2xl text-gray-900 mb-4">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600 text-lg leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our community has to say about WorkBridge.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <blockquote className="text-gray-700 italic leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of professionals building the future of work together.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button asChild size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-10 py-4 rounded-full shadow-lg">
              <Link href="/signup">Join WorkBridge</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-purple-600 text-lg px-10 py-4 rounded-full">
              <Link href="/freelancers">Explore Talent</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">W</span>
                </div>
                <span className="font-bold text-xl">WorkBridge</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Connecting talent with opportunities, building the future of work.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">For Freelancers</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/jobs" className="hover:text-white transition-colors">Find Work</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Create Profile</Link></li>
                <li><span className="text-gray-500">Success Stories</span></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">For Clients</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/freelancers" className="hover:text-white transition-colors">Find Talent</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Post Project</Link></li>
                <li><span className="text-gray-500">How It Works</span></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-2 text-gray-300">
                <li><span className="text-gray-500">About Us</span></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                <li><span className="text-gray-500">Contact</span></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 WorkBridge Technologies Pvt Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
