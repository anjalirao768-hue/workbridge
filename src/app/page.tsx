"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      quote: "WorkBridge helped me scale my startup faster than I imagined!",
      author: "Sarah Chen",
      role: "Startup Founder",
      type: "Client"
    },
    {
      quote: "Finally, a platform where payments are never a headache.",
      author: "Marcus Rivera",
      role: "Full Stack Developer",
      type: "Freelancer"
    },
    {
      quote: "The AI matching saved me hours finding the perfect designer.",
      author: "David Kim", 
      role: "Product Manager",
      type: "Client"
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    
    // Rotate testimonials
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const talents = [
    {
      name: "Priya S.",
      role: "UX Designer",
      rating: 4.9,
      projects: 200,
      avatar: "🎨",
      skills: ["UI/UX", "Figma", "Research"]
    },
    {
      name: "Rahul K.",
      role: "Full Stack Dev",
      rating: 5.0,
      projects: 150,
      avatar: "💻",
      skills: ["React", "Node.js", "AWS"]
    },
    {
      name: "Anna W.",
      role: "Growth Marketer",
      rating: 4.8,
      projects: 120,
      avatar: "📈",
      skills: ["SEO", "PPC", "Analytics"]
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform rotate-12 translate-x-full animate-pulse"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-16 h-16 bg-pink-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
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
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Freelance Collaboration</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Build seamless partnerships with transparent workflows, secure escrow payments, and AI-powered dispute resolution.
            </p>
            
            <div className="flex justify-center items-center mb-16">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                <Link href="/signup">Start Your Journey</Link>
              </Button>
            </div>

            {/* Supporting Stats */}
            <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
              <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/20 backdrop-blur-xl">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">1,500+</div>
                  <div className="text-blue-200">Projects Completed</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/20 backdrop-blur-xl">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-purple-400 mb-2">₹25Cr+</div>
                  <div className="text-purple-200">Secured in Escrow</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple. Fast. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Reliable.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/20 backdrop-blur-xl hover:border-blue-400/40 transition-all duration-300 hover:scale-105 group">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-4xl">🔍</span>
                </div>
                <CardTitle className="text-white text-2xl">Post or Browse</CardTitle>
                <CardDescription className="text-blue-200 text-lg">
                  Find top freelancers or the right project in minutes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/20 backdrop-blur-xl hover:border-purple-400/40 transition-all duration-300 hover:scale-105 group">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-4xl">🤝</span>
                </div>
                <CardTitle className="text-white text-2xl">Collaborate Smoothly</CardTitle>
                <CardDescription className="text-purple-200 text-lg">
                  Chat, share files, and track milestones in one place.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border-emerald-500/20 backdrop-blur-xl hover:border-emerald-400/40 transition-all duration-300 hover:scale-105 group">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  <span className="text-4xl">🛡️</span>
                </div>
                <CardTitle className="text-white text-2xl">Safe Payments</CardTitle>
                <CardDescription className="text-emerald-200 text-lg">
                  Escrow-backed payments ensure peace of mind for both sides.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Categories Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Talent Across <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Every Industry</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { name: "Design & Creative", icon: "🎨", color: "from-pink-500 to-rose-500" },
              { name: "Tech & Development", icon: "💻", color: "from-blue-500 to-cyan-500" },
              { name: "Marketing & Growth", icon: "📈", color: "from-green-500 to-emerald-500" },
              { name: "Writing & Translation", icon: "✍️", color: "from-purple-500 to-violet-500" },
              { name: "Finance & Consulting", icon: "📊", color: "from-orange-500 to-amber-500" }
            ].map((category, index) => (
              <Card key={index} className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-white/10 backdrop-blur-xl hover:border-white/30 transition-all duration-300 hover:scale-105 group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-2xl text-white">{category.icon}</span>
                  </div>
                  <h3 className="text-white font-semibold text-sm">{category.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Why WorkBridge Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Freelancers & Clients <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Choose Us</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🌍",
                title: "Global Reach",
                description: "Connect with talent in 100+ countries.",
                color: "from-blue-900/30 to-blue-800/20 border-blue-500/20"
              },
              {
                icon: "🤖",
                title: "AI Matching",
                description: "Smarter recommendations that save you hours.",
                color: "from-purple-900/30 to-purple-800/20 border-purple-500/20"
              },
              {
                icon: "🔒",
                title: "Secure Escrow",
                description: "Payments you can always trust.",
                color: "from-emerald-900/30 to-emerald-800/20 border-emerald-500/20"
              },
              {
                icon: "🕐",
                title: "24/7 Support",
                description: "Real help when you need it.",
                color: "from-orange-900/30 to-orange-800/20 border-orange-500/20"
              }
            ].map((feature, index) => (
              <Card key={index} className={`bg-gradient-to-br ${feature.color} backdrop-blur-xl hover:scale-105 transition-all duration-300 group`}>
                <CardHeader className="text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Talent Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Talent</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {talents.map((talent, index) => (
              <Card key={index} className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-white/10 backdrop-blur-xl hover:border-white/30 transition-all duration-300 hover:scale-105 group">
                <CardHeader className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">{talent.avatar}</span>
                  </div>
                  <CardTitle className="text-white text-xl">{talent.name}</CardTitle>
                  <CardDescription className="text-gray-300 mb-2">{talent.role}</CardDescription>
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-white font-semibold">{talent.rating}</span>
                    <span className="text-gray-400">({talent.projects}+ projects)</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {talent.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary" className="bg-white/10 text-white border-white/20">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What Our Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Says</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-white/10 backdrop-blur-xl">
              <CardContent className="p-12 text-center">
                <div className="text-6xl text-blue-400 mb-6">&ldquo;</div>
                <p className="text-2xl text-white mb-8 leading-relaxed">
                  {testimonials[currentTestimonial].quote}
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {testimonials[currentTestimonial].author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{testimonials[currentTestimonial].author}</div>
                    <div className="text-gray-400">{testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].type}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Testimonial Indicators */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentTestimonial === index ? 'bg-blue-500' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="container mx-auto px-4 py-20">
          <Card className="bg-gradient-to-r from-blue-900/80 to-purple-900/80 border-white/10 backdrop-blur-xl">
            <CardContent className="p-16 text-center">
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Ready to Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Next Project?</span>
              </h2>
              <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
                Join thousands of freelancers and clients building the future of work, one project at a time.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-12 py-4 rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105">
                  <Link href="/signup">Get Started for Free</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-2 border-white/40 text-white hover:bg-white/20 hover:border-white/60 text-lg px-12 py-4 rounded-full backdrop-blur-sm bg-white/10 transition-all duration-300">
                  <Link href="/explore">Explore Talent</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900/50 backdrop-blur-xl border-t border-white/10">
          <div className="container mx-auto px-4 py-16">
            <div className="grid md:grid-cols-4 gap-8">
              {/* Logo & Tagline */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">W</span>
                  </div>
                  <span className="text-white font-bold text-xl">WorkBridge</span>
                </div>
                <p className="text-gray-400 text-lg mb-6">Work Without Limits.</p>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                    <span className="text-sm">in</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                    <span className="text-sm">tw</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                    <span className="text-sm">ig</span>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Press</a></li>
                </ul>
              </div>

              {/* Support Links */}
              <div>
                <h4 className="text-white font-semibold mb-4">Support</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                  <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 mt-12 pt-8 text-center">
              <p className="text-gray-400">
                © 2025 WorkBridge. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
