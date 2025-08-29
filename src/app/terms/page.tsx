"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsAndConditions() {
  const [activeSection, setActiveSection] = useState("introduction");

  const sections = [
    { id: "introduction", title: "Introduction", icon: "📋" },
    { id: "eligibility", title: "Eligibility & Registration", icon: "✅" },
    { id: "platform-use", title: "Use of Platform", icon: "💼" },
    { id: "payments", title: "Payments & Escrow", icon: "💰" },
    { id: "disputes", title: "Refund & Dispute Policy", icon: "⚖️" },
    { id: "security", title: "Fraud Prevention & Security", icon: "🔒" },
    { id: "compliance", title: "Compliance & Legal", icon: "📜" },
    { id: "liability", title: "Limitation of Liability", icon: "🛡️" },
    { id: "termination", title: "Account Termination", icon: "🚫" },
    { id: "contact", title: "Contact Information", icon: "📞" }
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">WorkBridge Technologies Pvt Ltd</h1>
                <p className="text-sm text-gray-600">Terms & Conditions</p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href="/">← Back to Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg text-purple-700">Table of Contents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                      activeSection === section.id
                        ? "bg-purple-100 text-purple-800 border-l-4 border-purple-600"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <Card className="shadow-sm">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="text-2xl">Terms & Conditions</CardTitle>
                <p className="text-purple-100">Effective Date: January 1, 2025 | Last Updated: January 1, 2025</p>
              </CardHeader>
              <CardContent className="p-8 space-y-12">

                {/* Introduction */}
                <section id="introduction" className="scroll-mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-purple-200">
                    📋 1. Introduction
                  </h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      Welcome to <strong>WorkBridge Technologies Pvt Ltd</strong>, a Private Limited Company incorporated under the laws of India.
                    </p>
                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
                      <h4 className="font-semibold text-purple-800 mb-2">Platform Details:</h4>
                      <ul className="space-y-1 text-purple-700">
                        <li><strong>Website:</strong> www.workbridge.com</li>
                        <li><strong>Service:</strong> Freelancing marketplace platform</li>
                        <li><strong>Jurisdiction:</strong> India only</li>
                        <li><strong>Purpose:</strong> Connecting verified clients with qualified freelancers</li>
                      </ul>
                    </div>
                    <p>
                      By accessing or using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions. These terms constitute a legally binding agreement between you and WorkBridge Technologies Pvt Ltd.
                    </p>
                    <p className="text-sm text-gray-600 italic">
                      If you do not agree to these terms, you must immediately cease using our platform and services.
                    </p>
                  </div>
                </section>

                {/* Eligibility & Registration */}
                <section id="eligibility" className="scroll-mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-purple-200">
                    ✅ 2. Eligibility & Account Registration
                  </h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <h4 className="text-lg font-semibold text-gray-800">2.1 Verification Requirements</h4>
                    <p>All users must complete comprehensive KYC (Know Your Customer) verification before accessing platform features:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-medium text-blue-800 mb-2">Required Documents:</h5>
                        <ul className="space-y-1 text-blue-700 text-sm">
                          <li>• Valid PAN (Permanent Account Number)</li>
                          <li>• Aadhaar Card verification</li>
                          <li>• Bank account details with proof</li>
                          <li>• Professional credentials (if applicable)</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-medium text-green-800 mb-2">Account Benefits:</h5>
                        <ul className="space-y-1 text-green-700 text-sm">
                          <li>• Full platform access</li>
                          <li>• Secure payment processing</li>
                          <li>• Dispute resolution services</li>
                          <li>• Priority customer support</li>
                        </ul>
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-semibold text-gray-800 mt-6">2.2 Account Responsibilities</h4>
                    <ul className="space-y-2 ml-4">
                      <li>• Users must provide accurate, complete, and up-to-date information during registration</li>
                      <li>• Only verified accounts (both clients and freelancers) are authorized to conduct transactions</li>
                      <li>• Users are responsible for maintaining the confidentiality of their account credentials</li>
                      <li>• Multiple accounts by the same individual or entity are strictly prohibited</li>
                      <li>• Users must immediately notify us of any unauthorized account access</li>
                    </ul>

                    <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                      <p className="text-amber-800 font-medium">⚠️ Important: Providing false or misleading information during registration may result in immediate account suspension and legal action.</p>
                    </div>
                  </div>
                </section>

                {/* Use of Platform */}
                <section id="platform-use" className="scroll-mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-purple-200">
                    💼 3. Use of the Platform
                  </h2>
                  <div className="space-y-6 text-gray-700 leading-relaxed">
                    <h4 className="text-lg font-semibold text-gray-800">3.1 Platform Functionality</h4>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="border-blue-200">
                        <CardHeader className="bg-blue-50">
                          <CardTitle className="text-blue-800 flex items-center gap-2">
                            <span>🏢</span> For Clients
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="mt-4">
                          <ul className="space-y-2 text-sm">
                            <li>• Post detailed project requirements</li>
                            <li>• Review freelancer profiles and portfolios</li>
                            <li>• Set project milestones and deadlines</li>
                            <li>• Fund projects through secure escrow</li>
                            <li>• Monitor project progress and deliverables</li>
                            <li>• Provide feedback and ratings</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="border-green-200">
                        <CardHeader className="bg-green-50">
                          <CardTitle className="text-green-800 flex items-center gap-2">
                            <span>💻</span> For Freelancers
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="mt-4">
                          <ul className="space-y-2 text-sm">
                            <li>• Browse and bid on relevant projects</li>
                            <li>• Showcase skills and past work</li>
                            <li>• Accept project assignments</li>
                            <li>• Deliver work according to specifications</li>
                            <li>• Communicate with clients through platform</li>
                            <li>• Receive secure payments upon completion</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-800">3.2 Platform Role & Limitations</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium text-gray-800 mb-2">WorkBridge acts solely as an intermediary platform and:</p>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• Does NOT act as an employer, employee, or contractor</li>
                        <li>• Does NOT guarantee project quality, completion, or success</li>
                        <li>• Is NOT responsible for the conduct of users on the platform</li>
                        <li>• Facilitates connections but does not control project outcomes</li>
                      </ul>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-800">3.3 Prohibited Activities</h4>
                    <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                      <ul className="space-y-1 text-red-800 text-sm">
                        <li>• Circumventing platform payment systems</li>
                        <li>• Sharing personal contact information to avoid fees</li>
                        <li>• Posting fraudulent or misleading project descriptions</li>
                        <li>• Uploading copyrighted material without permission</li>
                        <li>• Engaging in harassment or inappropriate communication</li>
                        <li>• Creating fake reviews or manipulating ratings</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Payments & Escrow */}
                <section id="payments" className="scroll-mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-purple-200">
                    💰 4. Payments & Escrow System
                  </h2>
                  <div className="space-y-6 text-gray-700 leading-relaxed">
                    <h4 className="text-lg font-semibold text-gray-800">4.1 Escrow Process</h4>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                      <h5 className="font-semibold text-purple-800 mb-4">Payment Flow:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="text-2xl mb-2">1️⃣</div>
                          <p className="text-sm font-medium">Client Funds Project</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="text-2xl mb-2">2️⃣</div>
                          <p className="text-sm font-medium">Funds Held in Escrow</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="text-2xl mb-2">3️⃣</div>
                          <p className="text-sm font-medium">Work Delivered & Approved</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                          <div className="text-2xl mb-2">4️⃣</div>
                          <p className="text-sm font-medium">Automated Payout to Freelancer</p>
                        </div>
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-800">4.2 Payment Terms</h4>
                    <ul className="space-y-2 ml-4">
                      <li>• All payments are collected from clients before project commencement</li>
                      <li>• Funds are securely held in escrow until milestone completion or final delivery</li>
                      <li>• Automated payout APIs ensure quick fund release upon client approval</li>
                      <li>• Platform service fee is deducted before final payout to freelancers</li>
                      <li>• All transactions are processed through RBI-compliant payment gateways</li>
                    </ul>

                    <h4 className="text-lg font-semibold text-gray-800">4.3 Transaction Compliance</h4>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-green-800 font-medium mb-2">🏛️ RBI Compliance Standards:</p>
                      <ul className="space-y-1 text-green-700 text-sm">
                        <li>• Average ticket size monitoring and reporting</li>
                        <li>• Automated transaction reconciliation</li>
                        <li>• Real-time fraud detection and prevention</li>
                        <li>• Secure payment processing through authorized channels</li>
                        <li>• Complete audit trail maintenance</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Refund & Dispute Policy */}
                <section id="disputes" className="scroll-mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-purple-200">
                    ⚖️ 5. Refund & Dispute Resolution Policy
                  </h2>
                  <div className="space-y-6 text-gray-700 leading-relaxed">
                    <h4 className="text-lg font-semibold text-gray-800">5.1 Dispute Resolution Timeline</h4>
                    
                    <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
                      <h5 className="font-semibold text-yellow-800 mb-4">7-Day Structured Resolution Window:</h5>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-medium">Day 1-2</span>
                          <p className="text-sm">Dispute filing and initial review by our mediation team</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-medium">Day 3-5</span>
                          <p className="text-sm">Evidence collection and stakeholder communication</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-medium">Day 6-7</span>
                          <p className="text-sm">Final review and resolution decision announcement</p>
                        </div>
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-800">5.2 Refund Eligibility</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-medium text-green-800 mb-2">✅ Valid Refund Scenarios:</h5>
                        <ul className="space-y-1 text-green-700 text-sm">
                          <li>• Work not delivered as per specifications</li>
                          <li>• Freelancer abandoned project without notice</li>
                          <li>• Deliverables significantly below agreed quality</li>
                          <li>• Project timeline missed without valid reason</li>
                          <li>• Fraudulent activity by service provider</li>
                        </ul>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h5 className="font-medium text-red-800 mb-2">❌ Invalid Refund Requests:</h5>
                        <ul className="space-y-1 text-red-700 text-sm">
                          <li>• Change in client requirements post-acceptance</li>
                          <li>• Subjective dissatisfaction without valid grounds</li>
                          <li>• Disputes raised after 7-day completion window</li>
                          <li>• Client-caused project delays or scope changes</li>
                          <li>• Normal business disagreements</li>
                        </ul>
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-800">5.3 Final Decision Authority</h4>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-purple-800">
                        <strong>WorkBridge Technologies Pvt Ltd&apos;s decision after dispute review is final and binding.</strong> 
                        All parties agree to accept our mediation outcome and waive rights to external legal proceedings 
                        related to platform disputes, except in cases involving fraud or criminal activity.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Fraud Prevention & Security */}
                <section id="security" className="scroll-mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-purple-200">
                    🔒 6. Fraud Prevention & Security Measures
                  </h2>
                  <div className="space-y-6 text-gray-700 leading-relaxed">
                    <h4 className="text-lg font-semibold text-gray-800">6.1 AI-Driven Monitoring System</h4>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <Card className="border-blue-200">
                        <CardHeader className="bg-blue-50 text-center">
                          <div className="text-3xl mb-2">🤖</div>
                          <CardTitle className="text-blue-800 text-lg">AI Detection</CardTitle>
                        </CardHeader>
                        <CardContent className="mt-4">
                          <ul className="space-y-1 text-sm">
                            <li>• Real-time behavior analysis</li>
                            <li>• Suspicious pattern recognition</li>
                            <li>• Automated risk scoring</li>
                            <li>• Proactive threat identification</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="border-green-200">
                        <CardHeader className="bg-green-50 text-center">
                          <div className="text-3xl mb-2">👨‍💼</div>
                          <CardTitle className="text-green-800 text-lg">Manual Review</CardTitle>
                        </CardHeader>
                        <CardContent className="mt-4">
                          <ul className="space-y-1 text-sm">
                            <li>• Expert fraud analyst review</li>
                            <li>• High-risk transaction verification</li>
                            <li>• Account verification processes</li>
                            <li>• Escalated case investigation</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="border-purple-200">
                        <CardHeader className="bg-purple-50 text-center">
                          <div className="text-3xl mb-2">📊</div>
                          <CardTitle className="text-purple-800 text-lg">Real-time Logs</CardTitle>
                        </CardHeader>
                        <CardContent className="mt-4">
                          <ul className="space-y-1 text-sm">
                            <li>• Complete transaction tracking</li>
                            <li>• Automated reconciliation</li>
                            <li>• Audit trail maintenance</li>
                            <li>• Performance monitoring</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-800">6.2 Data Security & Hosting</h4>
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                      <div className="flex items-start gap-4">
                        <div className="bg-orange-100 p-3 rounded-lg">
                          <span className="text-2xl">☁️</span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-slate-800 mb-2">AWS Cloud Infrastructure</h5>
                          <ul className="space-y-1 text-slate-700 text-sm">
                            <li>• Enterprise-grade AWS hosting with 99.9% uptime guarantee</li>
                            <li>• End-to-end data encryption (AES-256) for all sensitive information</li>
                            <li>• Multi-factor authentication for administrative access</li>
                            <li>• Regular security audits and penetration testing</li>
                            <li>• Automated backup and disaster recovery protocols</li>
                            <li>• PCI DSS compliance for payment data handling</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-800">6.3 User Security Responsibilities</h4>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <ul className="space-y-1 text-amber-800 text-sm">
                        <li>• Users must maintain strong, unique passwords and enable two-factor authentication</li>
                        <li>• Immediately report any suspicious account activity or unauthorized access</li>
                        <li>• Avoid sharing personal or financial information outside the platform</li>
                        <li>• Report fraudulent users or projects through our reporting system</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Compliance & Legal */}
                <section id="compliance" className="scroll-mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-purple-200">
                    📜 7. Compliance & Legal Framework
                  </h2>
                  <div className="space-y-6 text-gray-700 leading-relaxed">
                    <h4 className="text-lg font-semibold text-gray-800">7.1 Regulatory Compliance</h4>
                    
                    <div className="bg-indigo-50 p-6 rounded-lg">
                      <h5 className="font-semibold text-indigo-800 mb-4">🏛️ RBI Compliance Framework:</h5>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h6 className="font-medium text-indigo-700 mb-2">Payment Processing:</h6>
                          <ul className="space-y-1 text-indigo-600 text-sm">
                            <li>• Authorized payment aggregator partnerships</li>
                            <li>• KYC-compliant transaction processing</li>
                            <li>• Anti-money laundering (AML) protocols</li>
                            <li>• Regular compliance audits and reporting</li>
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-medium text-indigo-700 mb-2">Financial Regulations:</h6>
                          <ul className="space-y-1 text-indigo-600 text-sm">
                            <li>• FEMA compliance for cross-border transactions</li>
                            <li>• GST registration and tax compliance</li>
                            <li>• Reserve Bank of India guidelines adherence</li>
                            <li>• Transparent fee structure disclosure</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-800">7.2 Legal Jurisdiction & Governing Law</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <ul className="space-y-2 text-gray-700">
                        <li>• These Terms & Conditions are governed by the laws of India</li>
                        <li>• All disputes are subject to the exclusive jurisdiction of courts in [Your City], India</li>
                        <li>• Users agree to abide by Indian IT laws, including the Information Technology Act, 2000</li>
                        <li>• Compliance with Indian financial regulations and RBI guidelines is mandatory</li>
                        <li>• Data protection follows Indian Personal Data Protection Bill guidelines</li>
                      </ul>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-800">7.3 Tax Responsibilities</h4>
                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                      <p className="text-yellow-800 font-medium mb-2">📋 Important Tax Information:</p>
                      <ul className="space-y-1 text-yellow-700 text-sm">
                        <li>• Users are responsible for their own tax obligations related to platform earnings</li>
                        <li>• WorkBridge will provide necessary transaction records for tax filing purposes</li>
                        <li>• TDS (Tax Deducted at Source) may apply as per Indian tax regulations</li>
                        <li>• Professional tax advice should be sought for complex tax situations</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Limitation of Liability */}
                <section id="liability" className="scroll-mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-purple-200">
                    🛡️ 8. Limitation of Liability
                  </h2>
                  <div className="space-y-6 text-gray-700 leading-relaxed">
                    <h4 className="text-lg font-semibold text-gray-800">8.1 Platform Liability Limitations</h4>
                    
                    <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
                      <h5 className="font-semibold text-red-800 mb-4">⚠️ WorkBridge is NOT liable for:</h5>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h6 className="font-medium text-red-700 mb-2">Project-Related Issues:</h6>
                          <ul className="space-y-1 text-red-600 text-sm">
                            <li>• Quality of work delivered by freelancers</li>
                            <li>• Project scope disagreements between parties</li>
                            <li>• Missed deadlines due to external factors</li>
                            <li>• Intellectual property disputes</li>
                            <li>• Professional misconduct by users</li>
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-medium text-red-700 mb-2">Technical & External:</h6>
                          <ul className="space-y-1 text-red-600 text-sm">
                            <li>• Third-party service provider failures</li>
                            <li>• Internet connectivity or technical issues</li>
                            <li>• Force majeure events beyond our control</li>
                            <li>• User device or software compatibility</li>
                            <li>• External website or service disruptions</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-800">8.2 Maximum Liability Cap</h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-800 font-medium">
                        📊 <strong>Financial Liability Limitation:</strong> WorkBridge&apos;s maximum liability for any claim 
                        is limited to the amount currently held in escrow for the specific disputed project. 
                        This cap applies to all damages including direct, indirect, incidental, or consequential losses.
                      </p>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-800">8.3 User Indemnification</h4>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-purple-800">
                        Users agree to indemnify and hold harmless WorkBridge Technologies Pvt Ltd, its directors, 
                        employees, and affiliates from any claims, damages, or legal expenses arising from their use 
                        of the platform, violation of these terms, or infringement of third-party rights.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Account Termination */}
                <section id="termination" className="scroll-mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-purple-200">
                    🚫 9. Account Termination Policy
                  </h2>
                  <div className="space-y-6 text-gray-700 leading-relaxed">
                    <h4 className="text-lg font-semibold text-gray-800">9.1 Grounds for Account Termination</h4>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <Card className="border-red-200">
                        <CardHeader className="bg-red-50">
                          <CardTitle className="text-red-800 flex items-center gap-2">
                            <span>🚨</span> Fraudulent Activity
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="mt-4">
                          <ul className="space-y-1 text-sm text-red-700">
                            <li>• Fake identity or credentials</li>
                            <li>• Payment fraud or chargebacks</li>
                            <li>• Manipulation of reviews/ratings</li>
                            <li>• Multiple account creation</li>
                            <li>• Money laundering activities</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="border-orange-200">
                        <CardHeader className="bg-orange-50">
                          <CardTitle className="text-orange-800 flex items-center gap-2">
                            <span>📋</span> Policy Violations
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="mt-4">
                          <ul className="space-y-1 text-sm text-orange-700">
                            <li>• Repeated Terms & Conditions breaches</li>
                            <li>• Circumventing platform fees</li>
                            <li>• Harassment or inappropriate conduct</li>
                            <li>• Sharing prohibited content</li>
                            <li>• Violation of intellectual property</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="border-purple-200">
                        <CardHeader className="bg-purple-50">
                          <CardTitle className="text-purple-800 flex items-center gap-2">
                            <span>⚖️</span> Legal Non-Compliance
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="mt-4">
                          <ul className="space-y-1 text-sm text-purple-700">
                            <li>• Failure to complete KYC verification</li>
                            <li>• Non-compliance with tax obligations</li>
                            <li>• Violation of Indian IT laws</li>
                            <li>• Refusal to cooperate in investigations</li>
                            <li>• Criminal activity involvement</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-800">9.2 Termination Process</h4>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="grid md:grid-cols-4 gap-4 text-center">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="text-2xl mb-2 text-blue-600">1️⃣</div>
                          <h6 className="font-medium text-gray-800">Investigation</h6>
                          <p className="text-xs text-gray-600 mt-1">Thorough review of reported violations</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="text-2xl mb-2 text-yellow-600">2️⃣</div>
                          <h6 className="font-medium text-gray-800">Notice Period</h6>
                          <p className="text-xs text-gray-600 mt-1">48-hour notice (except emergency cases)</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="text-2xl mb-2 text-orange-600">3️⃣</div>
                          <h6 className="font-medium text-gray-800">Account Suspension</h6>
                          <p className="text-xs text-gray-600 mt-1">Immediate access restriction</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="text-2xl mb-2 text-red-600">4️⃣</div>
                          <h6 className="font-medium text-gray-800">Data Retention</h6>
                          <p className="text-xs text-gray-600 mt-1">Legal compliance period storage</p>
                        </div>
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-800">9.3 Post-Termination Rights & Obligations</h4>
                    <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                      <ul className="space-y-1 text-amber-800 text-sm">
                        <li>• <strong>Pending Projects:</strong> Existing projects may continue with escrowed funds protected</li>
                        <li>• <strong>Payment Recovery:</strong> Users can claim legitimate outstanding payments within 30 days</li>
                        <li>• <strong>Data Access:</strong> Personal data can be requested within legal compliance periods</li>
                        <li>• <strong>Appeal Process:</strong> Users may appeal termination decisions within 15 days</li>
                        <li>• <strong>Platform Ban:</strong> Terminated users are permanently banned from creating new accounts</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Contact Information */}
                <section id="contact" className="scroll-mt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-purple-200">
                    📞 10. Contact Information & Support
                  </h2>
                  <div className="space-y-6 text-gray-700 leading-relaxed">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="border-blue-200">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          <CardTitle className="flex items-center gap-2">
                            <span>📧</span> Customer Support
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="mt-6 space-y-4">
                          <div>
                            <h6 className="font-medium text-gray-800">Email Support:</h6>
                            <p className="text-blue-600 font-medium">support@workbridge.com</p>
                            <p className="text-sm text-gray-600">Response Time: Within 24 hours</p>
                          </div>
                          <div>
                            <h6 className="font-medium text-gray-800">Phone Support:</h6>
                            <p className="text-blue-600 font-medium">+91-9876543210</p>
                            <p className="text-sm text-gray-600">Available: Mon-Fri, 9 AM - 6 PM IST</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-green-200">
                        <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
                          <CardTitle className="flex items-center gap-2">
                            <span>🏢</span> Legal & Compliance
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="mt-6 space-y-4">
                          <div>
                            <h6 className="font-medium text-gray-800">Legal Department:</h6>
                            <p className="text-green-600 font-medium">legal@workbridge-demo.com</p>
                            <p className="text-sm text-gray-600">For legal notices and compliance matters</p>
                          </div>
                          <div>
                            <h6 className="font-medium text-gray-800">Grievance Officer:</h6>
                            <p className="text-green-600 font-medium">grievance@workbridge-demo.com</p>
                            <p className="text-sm text-gray-600">For formal complaints and dispute escalation</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
                      <h4 className="text-lg font-semibold text-purple-800 mb-4">🏢 Corporate Information</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <p><strong>Company Name:</strong> WorkBridge Technologies Pvt Ltd</p>
                          <p><strong>Registration:</strong> Private Limited Company (India)</p>
                          <p><strong>Website:</strong> <a href="https://workbridge-demo.com" className="text-blue-600 underline">www.workbridge-demo.com</a></p>
                        </div>
                        <div className="space-y-2">
                          <p><strong>Business Type:</strong> Freelancing Marketplace Platform</p>
                          <p><strong>Jurisdiction:</strong> Republic of India</p>
                          <p><strong>Terms Version:</strong> 1.0 (Effective January 1, 2025)</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                      <p className="text-yellow-800 text-sm">
                        <strong>📋 Important:</strong> These Terms & Conditions may be updated periodically. 
                        Users will be notified of significant changes via email and platform notifications. 
                        Continued use of the platform after such modifications constitutes acceptance of the updated terms.
                      </p>
                    </div>
                  </div>
                </section>

              </CardContent>
            </Card>

            {/* Footer */}
            <Card className="mt-8 bg-gray-900 text-white">
              <CardContent className="p-6 text-center">
                <p className="mb-2">© 2025 WorkBridge Technologies Pvt Ltd. All rights reserved.</p>
                <p className="text-gray-400 text-sm">
                  These Terms & Conditions are effective from January 1, 2025, and are governed by the laws of India.
                </p>
                <div className="mt-4">
                  <Button asChild variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    <Link href="/">Return to WorkBridge Home</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}