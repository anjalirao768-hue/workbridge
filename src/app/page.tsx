"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const categories = [
    { name: "Development & IT", icon: "💻", jobs: "2,847 jobs posted" },
    { name: "Design & Creative", icon: "🎨", jobs: "1,923 jobs posted" },
    { name: "Sales & Marketing", icon: "📈", jobs: "1,456 jobs posted" },
    { name: "Writing & Translation", icon: "✍️", jobs: "987 jobs posted" },
    { name: "Admin & Customer Support", icon: "🎧", jobs: "756 jobs posted" },
    { name: "Finance & Accounting", icon: "💰", jobs: "543 jobs posted" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-gray-900 font-bold text-xl">WorkBridge</span>
            </Link>

            {/* Main Navigation Buttons */}
            <div className="hidden md:flex items-center space-x-6">
              <Button asChild variant="ghost" className="text-gray-600 hover:text-gray-900 font-medium">
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

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Work Without Limits
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Find talented freelancers or discover your next opportunity. 
              Join thousands of professionals building the future of work.
            </p>
            
            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/freelancers">Find Talent</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 text-lg px-8 py-4 rounded-lg">
                <Link href="/jobs">Find Work</Link>
              </Button>
            </div>

            {/* Supporting Stats */}
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">10K+</span>
                <span>Active Freelancers</span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">5K+</span>
                <span>Projects Completed</span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-gray-900">98%</span>
                <span>Client Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Browse talent by category
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Looking for work? Browse jobs and get started as a freelancer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Link key={index} href="/jobs" className="group">
                <Card className="hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-green-300 group-hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{category.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-gray-600 mt-1">{category.jobs}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How WorkBridge works
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* For Clients */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">For Clients</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Post a job</h4>
                    <p className="text-gray-600">Tell us what you need done and receive competitive proposals from freelancers.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Choose freelancers</h4>
                    <p className="text-gray-600">Compare profiles, portfolios, and proposals, then interview your favorites.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Get work done</h4>
                    <p className="text-gray-600">Collaborate easily, get updates, and approve work through our platform.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Freelancers */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8">For Freelancers</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Create your profile</h4>
                    <p className="text-gray-600">Showcase your skills, experience, and portfolio to attract clients.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Find great work</h4>
                    <p className="text-gray-600">Browse jobs that match your skills and submit compelling proposals.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Get paid safely</h4>
                    <p className="text-gray-600">Receive payments on time through our reliable platform.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join thousands of freelancers and clients building amazing projects together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-4 rounded-lg">
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600 text-lg px-8 py-4 rounded-lg">
                <Link href="/freelancers">Browse Talent</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">For Clients</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/freelancers" className="hover:text-white transition-colors">Find Freelancers</Link></li>
                <li><Link href="/jobs" className="hover:text-white transition-colors">Post a Job</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">For Freelancers</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/jobs" className="hover:text-white transition-colors">Find Work</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Create Profile</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Company</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/home" className="hover:text-white transition-colors">About</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/login" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><span className="text-gray-400">Contact Us</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">W</span>
              </div>
              <span className="font-bold text-lg">WorkBridge</span>
            </div>
            <p className="text-gray-400">
              © 2024 WorkBridge Technologies Pvt Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
