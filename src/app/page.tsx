"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-16 h-16 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-40 right-10 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl animate-pulse delay-3000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="text-white font-bold text-xl">WorkBridge</span>
            </div>
            <div className="flex space-x-4">
              <Button asChild variant="ghost" className="text-white hover:text-blue-300">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2">
              🚀 The Future of Freelancing
            </Badge>
            
            <h1 className="text-7xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-purple-200 mb-6 leading-tight">
              Work<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Bridge</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Experience the next generation of freelance collaboration with 
              <span className="text-blue-400 font-semibold"> transparent workflows</span>, 
              <span className="text-purple-400 font-semibold"> secure escrow payments</span>, and 
              <span className="text-pink-400 font-semibold"> intelligent dispute resolution</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                <Link href="/signup">Start Your Journey</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-white/20 text-white hover:bg-white/10 text-lg px-8 py-4 rounded-full backdrop-blur-sm">
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">1000+</div>
                <div className="text-sm text-gray-400">Projects Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">$2.5M+</div>
                <div className="text-sm text-gray-400">Secured in Escrow</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400">99.9%</div>
                <div className="text-sm text-gray-400">Payment Success</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-20">
          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-4">
              Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Excellence</span>
            </h2>
            <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
              Every feature designed to create trust, transparency, and success in the freelance ecosystem
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-20">
              {/* Client Card */}
              <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-500/20 backdrop-blur-xl hover:border-blue-400/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <CardTitle className="text-white text-xl text-center">For Visionary Clients</CardTitle>
                  <CardDescription className="text-blue-200 text-center">
                    Transform ideas into reality with top-tier talent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-blue-100">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      Advanced escrow protection system
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      AI-powered milestone tracking
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      Transparent 5% platform investment
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      24/7 dispute resolution support
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Freelancer Card */}
              <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500/20 backdrop-blur-xl hover:border-purple-400/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl">💻</span>
                  </div>
                  <CardTitle className="text-white text-xl text-center">For Elite Freelancers</CardTitle>
                  <CardDescription className="text-purple-200 text-center">
                    Showcase your expertise and secure premium projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-purple-100">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      Curated high-value opportunities
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      Guaranteed payment security
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      Advanced portfolio showcase
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      Fair & fast dispute resolution
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Platform Card */}
              <Card className="bg-gradient-to-br from-pink-900/50 to-pink-800/30 border-pink-500/20 backdrop-blur-xl hover:border-pink-400/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl">⚖️</span>
                  </div>
                  <CardTitle className="text-white text-xl text-center">Enterprise Security</CardTitle>
                  <CardDescription className="text-pink-200 text-center">
                    Built with trust, transparency, and reliability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-pink-100">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      Blockchain-level audit trails
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      Real-time admin oversight
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      Intelligent automated workflows
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      Bank-grade security protocols
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Demo Credentials Section */}
            <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-3xl p-12 border border-white/10 shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Experience WorkBridge Today</h2>
                <p className="text-gray-400">Try our demo environment with pre-configured accounts</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 p-6 rounded-2xl border border-red-500/20 hover:border-red-400/40 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <h3 className="font-semibold text-red-100">Admin Dashboard</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="text-red-200">
                      <span className="text-red-400 font-medium">Email:</span> admin@workbridge.com
                    </div>
                    <div className="text-red-200">
                      <span className="text-red-400 font-medium">Password:</span> password123
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-6 rounded-2xl border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">C</span>
                    </div>
                    <h3 className="font-semibold text-blue-100">Client Portal</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="text-blue-200">
                      <span className="text-blue-400 font-medium">Email:</span> client1@test.com
                    </div>
                    <div className="text-blue-200">
                      <span className="text-blue-400 font-medium">Password:</span> password123
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 p-6 rounded-2xl border border-green-500/20 hover:border-green-400/40 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">F</span>
                    </div>
                    <h3 className="font-semibold text-green-100">Freelancer Hub</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="text-green-200">
                      <span className="text-green-400 font-medium">Email:</span> freelancer1@test.com
                    </div>
                    <div className="text-green-200">
                      <span className="text-green-400 font-medium">Password:</span> password123
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <Badge variant="outline" className="border-yellow-500/30 text-yellow-300 bg-yellow-500/10">
                  🧪 Demo Environment • Mock Escrow Functionality
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-12 text-center">
          <div className="text-gray-500 text-sm">
            © 2024 WorkBridge. Revolutionizing freelance collaboration with secure escrow technology.
          </div>
        </footer>
      </div>
    </div>
  );
}
