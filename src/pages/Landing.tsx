import { Link } from 'react-router-dom';
import { useState } from 'react';
import { MessageSquare, Store, Users, Building2, Sparkles, DollarSign, Smartphone, TrendingUp, Shield, Lock, Database, FileText, ChevronDown, ChevronUp, CheckCircle, Star, Quote } from 'lucide-react';
import { Button } from '../components/shared/Button';

export function Landing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [expandedTrust, setExpandedTrust] = useState<number | null>(null);

  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  const pricingPlans = [
    {
      name: 'Starter',
      monthlyPrice: 7.99,
      annualPrice: 6.99,
      responses: 250,
      features: [
        'Unlimited surveys',
        'AI-powered follow-ups',
        'Basic dashboards',
        '1 manager account'
      ]
    },
    {
      name: 'Growth',
      monthlyPrice: 14.99,
      annualPrice: 10.99,
      responses: 1000,
      popular: true,
      features: [
        'Custom branding',
        'Review-boost tools',
        '5 manager accounts',
        'CSV exports',
        'Priority support'
      ]
    },
    {
      name: 'Business',
      monthlyPrice: 29.99,
      annualPrice: 20.99,
      responses: 2500,
      features: [
        'Multi-location support',
        'Advanced analytics',
        'API integrations',
        'Unlimited managers',
        'Priority support'
      ]
    }
  ];

  const trustItems = [
    {
      title: 'Anonymous by Default',
      content: 'No PII unless chosen. Respondents can share feedback without revealing their identity, encouraging honest responses.'
    },
    {
      title: 'GDPR/PIPEDA Compliant',
      content: 'NA/EU servers available. We comply with major data protection regulations to keep your data safe and compliant.'
    },
    {
      title: 'Clear Deletion Controls',
      content: 'Delete surveys, responses, and accounts at any time. You maintain full control over your data lifecycle.'
    },
    {
      title: 'Enterprise Security Roadmap',
      content: 'SOC2, SSO, and advanced compliance features coming soon for enterprise customers.'
    }
  ];

  const aeoFaqs = [
    {
      question: 'How does Fydbak differ from Typeform or SurveyMonkey?',
      answer: 'Fydbak uses AI-powered conversational follow-ups to dig deeper into responses, providing context that static forms miss. Unlike traditional survey tools, Fydbak adapts to each answer, asking intelligent follow-up questions that uncover the "why" behind feedback. It\'s designed specifically for mobile-first, QR code-driven surveys that work in restaurants, clinics, retail stores, and with field teams.'
    },
    {
      question: 'Will it keep feedback anonymous?',
      answer: 'Yes, absolutely. Fydbak is anonymous by default. Unless you specifically choose to collect PII (like names or emails), all responses remain completely anonymous. This encourages honest, actionable feedback from both customers and team members without fear of identification.'
    },
    {
      question: 'Does it work for both customers and staff?',
      answer: 'Yes! Fydbak is versatile. Use QR codes at checkout for customer feedback at restaurants or clinics, send links to retail teams for field insights, or pulse your staff to track morale and spot blockers. The same powerful AI follow-ups work across all use cases—from guest reviews to team management.'
    },
    {
      question: 'What data do you store, and for how long?',
      answer: 'We store survey questions, responses, and AI-generated summaries. You control retention—delete individual responses, entire surveys, or your account anytime. Data is stored securely on NA/EU servers (your choice) and complies with GDPR and PIPEDA regulations. We never sell or share your data with third parties.'
    },
    {
      question: 'Can I try it risk-free?',
      answer: 'Yes! Start with our Starter plan at $7.99/mo (or $6.99/mo annually) with no setup fees. You can switch plans, upgrade, downgrade, or cancel anytime. There are no hidden fees or long-term contracts—pay only for what you use.'
    }
  ];

  const pricingSidebarFaqs = [
    {
      question: 'How does annual billing work?',
      answer: 'Annual is charged once upfront for 12 months at the lower per-month rate. You save up to 30%.'
    },
    {
      question: 'Can I switch between monthly and annual?',
      answer: 'Yes, upgrades take effect on your next billing cycle.'
    },
    {
      question: 'What if I cancel?',
      answer: 'Cancel anytime. Monthly ends at billing period close. Annual keeps full access until year\'s end.'
    },
    {
      question: 'Are there hidden fees?',
      answer: 'No. Every plan includes all features. Only response caps differ.'
    },
    {
      question: 'Can I change plans as I grow?',
      answer: 'Yes. Upgrade or downgrade anytime. Changes are pro-rated.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <nav className="border-b border-[#eaeef3] bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 bg-[#4257f4] rounded-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#232637]">Fydbak</span>
            </Link>
            <div className="flex items-center space-x-4">
              <button onClick={scrollToPricing}>
                <Button variant="ghost">Pricing</Button>
              </button>
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-[#4257f4] hover:bg-[#3648e3]">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#3cf4c7] rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-[#4257f4] rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-[#f93c56] rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
          </div>

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#232637] mb-6 leading-tight">
              Chat-style feedback people actually answer.
            </h1>
            <p className="text-xl md:text-2xl text-[#232637]/70 max-w-4xl mx-auto mb-10 leading-relaxed">
              Fydbak gets honest, actionable insights—whether from a customer scanning a QR code at a café or a retail manager pulsing their field team. AI-powered follow-ups uncover the 'why' behind every response.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={scrollToDemo} className="bg-[#4257f4] hover:bg-[#3648e3] text-lg px-8">
                Try Live Demo
              </Button>
              <Button size="lg" variant="outline" onClick={scrollToPricing} className="border-[#4257f4] text-[#4257f4] hover:bg-[#4257f4]/5 text-lg px-8">
                See Pricing
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-[#232637] text-center mb-12">
              Where Fydbak Works
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              <div className="group bg-white border border-[#eaeef3] rounded-xl p-5 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-[#4257f4]">
                <div className="w-12 h-12 bg-[#f93c56]/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Store className="w-6 h-6 text-[#f93c56]" />
                </div>
                <h3 className="text-lg font-bold text-[#232637] mb-2">Restaurants & Clinics</h3>
                <p className="text-sm text-[#232637]/60 leading-relaxed">
                  QR code surveys for guest feedback & reviews.
                </p>
              </div>

              <div className="group bg-white border border-[#eaeef3] rounded-xl p-5 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-[#4257f4]">
                <div className="w-12 h-12 bg-[#4257f4]/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 text-[#4257f4]" />
                </div>
                <h3 className="text-lg font-bold text-[#232637] mb-2">Retail & Service</h3>
                <p className="text-sm text-[#232637]/60 leading-relaxed">
                  Checkout and field team insights with a simple link.
                </p>
              </div>

              <div className="group bg-white border border-[#eaeef3] rounded-xl p-5 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-[#4257f4]">
                <div className="w-12 h-12 bg-[#3cf4c7]/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-[#3cf4c7]" />
                </div>
                <h3 className="text-lg font-bold text-[#232637] mb-2">Team Managers</h3>
                <p className="text-sm text-[#232637]/60 leading-relaxed">
                  Pulse your staff, spot blockers, track morale.
                </p>
              </div>

              <div className="group bg-white border border-[#eaeef3] rounded-xl p-5 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-[#4257f4]">
                <div className="w-12 h-12 bg-[#f6c700]/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6 text-[#f6c700]" />
                </div>
                <h3 className="text-lg font-bold text-[#232637] mb-2">Enterprise</h3>
                <p className="text-sm text-[#232637]/60 leading-relaxed">
                  Roll out chat surveys across brands or locations.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#fafbfc]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-[#232637] text-center mb-12">
              Why Fydbak Wins
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              <div className="bg-white border border-[#eaeef3] rounded-xl p-5 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[#4257f4]/10 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-[#4257f4]" />
                </div>
                <h3 className="text-lg font-bold text-[#232637] mb-2">AI Follow-ups</h3>
                <p className="text-sm text-[#232637]/60 leading-relaxed">
                  Go deeper than star ratings or static forms.
                </p>
              </div>

              <div className="bg-white border border-[#eaeef3] rounded-xl p-5 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[#3cf4c7]/10 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-[#3cf4c7]" />
                </div>
                <h3 className="text-lg font-bold text-[#232637] mb-2">Fair Pricing</h3>
                <p className="text-sm text-[#232637]/60 leading-relaxed">
                  Simple monthly or annual plans. No per-seat fees.
                </p>
              </div>

              <div className="bg-white border border-[#eaeef3] rounded-xl p-5 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[#f93c56]/10 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-[#f93c56]" />
                </div>
                <h3 className="text-lg font-bold text-[#232637] mb-2">Mobile-first</h3>
                <p className="text-sm text-[#232637]/60 leading-relaxed">
                  Designed for phones, perfect for QR surveys.
                </p>
              </div>

              <div className="bg-white border border-[#eaeef3] rounded-xl p-5 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-[#f6c700]/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-[#f6c700]" />
                </div>
                <h3 className="text-lg font-bold text-[#232637] mb-2">Scalable</h3>
                <p className="text-sm text-[#232637]/60 leading-relaxed">
                  Works for one café or 100+ retail stores.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="demo" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-[#232637] text-center mb-4">
              Interactive Demo
            </h2>
            <p className="text-xl text-[#232637]/60 text-center mb-12 max-w-2xl mx-auto">
              Experience Fydbak from your phone—scan and see for yourself.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-gradient-to-br from-[#4257f4]/5 to-[#3cf4c7]/5 rounded-3xl p-8 border border-[#eaeef3]">
                <h3 className="text-2xl font-bold text-[#232637] mb-6 flex items-center">
                  <Store className="w-6 h-6 mr-2 text-[#4257f4]" />
                  Customer QR Survey
                </h3>
                <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
                  <div className="bg-[#eaeef3] rounded-lg p-4">
                    <p className="text-[#232637] font-medium">How was your dining experience today?</p>
                  </div>
                  <div className="bg-[#4257f4] rounded-lg p-4 ml-8">
                    <p className="text-white">It was great! The food came out quickly.</p>
                  </div>
                  <div className="bg-[#eaeef3] rounded-lg p-4">
                    <p className="text-[#232637] font-medium">That's wonderful! What stood out most about the service?</p>
                  </div>
                  <div className="bg-[#4257f4] rounded-lg p-4 ml-8">
                    <p className="text-white">Our server was very attentive and friendly.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#f93c56]/5 to-[#f6c700]/5 rounded-3xl p-8 border border-[#eaeef3]">
                <h3 className="text-2xl font-bold text-[#232637] mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-[#f93c56]" />
                  Team Pulse Survey
                </h3>
                <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
                  <div className="bg-[#eaeef3] rounded-lg p-4">
                    <p className="text-[#232637] font-medium">What's blocking your team from hitting targets this week?</p>
                  </div>
                  <div className="bg-[#f93c56] rounded-lg p-4 ml-8">
                    <p className="text-white">Inventory delays are frustrating customers.</p>
                  </div>
                  <div className="bg-[#eaeef3] rounded-lg p-4">
                    <p className="text-[#232637] font-medium">Can you share a specific example of how this affected a sale?</p>
                  </div>
                  <div className="bg-[#f93c56] rounded-lg p-4 ml-8">
                    <p className="text-white">Customer wanted a product we showed online but it was out of stock.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-[#4257f4]/10 to-[#3cf4c7]/10 rounded-2xl p-8 border border-[#eaeef3]">
              <div className="w-48 h-48 bg-white rounded-2xl p-4 shadow-lg mb-6">
                <div className="w-full h-full bg-[#232637] rounded-xl flex items-center justify-center">
                  <p className="text-white text-xs text-center">QR Code<br/>Placeholder</p>
                </div>
              </div>
              <p className="text-[#232637] font-semibold text-lg text-center">
                Scan to try a real Fydbak survey on your phone
              </p>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#fafbfc]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-[#232637] mb-4">
                Simple pricing. No setup fees.
              </h2>
              <p className="text-xl text-[#232637]/60 mb-8">
                Pay only for what you use.
              </p>

              <div className="flex items-center justify-center gap-4 mb-4">
                <span className={`font-semibold ${billingPeriod === 'monthly' ? 'text-[#232637]' : 'text-[#232637]/40'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
                  className="relative w-14 h-7 bg-[#4257f4] rounded-full transition-colors"
                >
                  <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${billingPeriod === 'annual' ? 'translate-x-7' : ''}`}></div>
                </button>
                <span className={`font-semibold ${billingPeriod === 'annual' ? 'text-[#232637]' : 'text-[#232637]/40'}`}>
                  Annual
                </span>
              </div>

              {billingPeriod === 'annual' && (
                <div className="inline-block bg-[#3cf4c7]/20 border border-[#3cf4c7] rounded-full px-4 py-2 text-[#232637] font-semibold text-sm">
                  Save up to 30% with yearly billing — discount applied automatically at checkout
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 mb-12">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {pricingPlans.map((plan) => (
                    <div
                      key={plan.name}
                      className={`relative bg-white rounded-2xl p-8 border-2 transition-all hover:shadow-xl ${
                        plan.popular
                          ? 'border-[#4257f4] shadow-lg scale-105'
                          : 'border-[#eaeef3] hover:border-[#4257f4]'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <span className="bg-gradient-to-r from-[#4257f4] to-[#3cf4c7] text-white px-4 py-1 rounded-full text-sm font-bold flex items-center whitespace-nowrap">
                            <Star className="w-4 h-4 mr-1" />
                            Best Value
                          </span>
                        </div>
                      )}

                      <h3 className="text-2xl font-bold text-[#232637] mb-2">{plan.name}</h3>
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-[#232637]">
                          ${billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                        </span>
                        <span className="text-[#232637]/60">/mo</span>
                        {billingPeriod === 'annual' && (
                          <p className="text-sm text-[#3cf4c7] font-semibold mt-1">
                            Save ${((plan.monthlyPrice - plan.annualPrice) * 12).toFixed(2)}/year
                          </p>
                        )}
                      </div>

                      <div className="mb-6">
                        <div className="bg-[#eaeef3] rounded-full h-2 mb-2">
                          <div
                            className="bg-gradient-to-r from-[#4257f4] to-[#3cf4c7] h-2 rounded-full"
                            style={{ width: '60%' }}
                          ></div>
                        </div>
                        <p className="text-sm text-[#232637]/60">Up to {plan.responses} responses/mo</p>
                      </div>

                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start text-sm">
                            <CheckCircle className="w-5 h-5 text-[#3cf4c7] mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-[#232637]/70">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Link to="/register">
                        <Button
                          className={`w-full ${
                            plan.popular
                              ? 'bg-[#4257f4] hover:bg-[#3648e3]'
                              : 'bg-[#232637] hover:bg-[#232637]/90'
                          }`}
                        >
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-[#eaeef3] h-fit">
                <h3 className="text-xl font-bold text-[#232637] mb-6">Pricing FAQ</h3>
                <div className="space-y-4">
                  {pricingSidebarFaqs.map((faq, index) => (
                    <div key={index} className="border-b border-[#eaeef3] pb-4 last:border-0">
                      <h4 className="font-semibold text-[#232637] text-sm mb-2">{faq.question}</h4>
                      <p className="text-sm text-[#232637]/60">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-[#232637]/60">
              Switch, upgrade, or cancel anytime.
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#09203f]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
              Trust & Security
            </h2>

            <div className="space-y-3">
              {trustItems.map((item, index) => (
                <div key={index} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
                  <button
                    onClick={() => setExpandedTrust(expandedTrust === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-[#3cf4c7] mr-3" />
                      <span className="font-semibold text-white">{item.title}</span>
                    </div>
                    {expandedTrust === index ? (
                      <ChevronUp className="w-5 h-5 text-white" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-white" />
                    )}
                  </button>
                  {expandedTrust === index && (
                    <div className="px-6 pb-6">
                      <p className="text-white/70 leading-relaxed">{item.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-[#232637] text-center mb-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {aeoFaqs.map((faq, index) => (
                <div key={index} className="bg-[#fafbfc] border border-[#eaeef3] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-[#eaeef3]/50 transition-colors"
                  >
                    <span className="font-semibold text-[#232637] pr-4">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-[#4257f4] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#4257f4] flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-[#232637]/70 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#fafbfc]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-[#232637] text-center mb-12">
              Success Stories
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-[#eaeef3] rounded-2xl p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-[#f93c56]/10 rounded-full flex items-center justify-center mr-4">
                    <Store className="w-6 h-6 text-[#f93c56]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#232637]">Local Restaurant</h3>
                    <p className="text-sm text-[#232637]/60">QR code at tables</p>
                  </div>
                </div>
                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-[#4257f4]/20" />
                  <p className="text-[#232637]/70 leading-relaxed pl-6">
                    "30 responses in 2 days gave us insights we never had before. Learned our patio is drafty in evenings and our weekend server Sarah is beloved. Made immediate changes."
                  </p>
                </div>
                <div className="mt-6 flex items-center text-sm text-[#232637]/60">
                  <TrendingUp className="w-4 h-4 mr-2 text-[#3cf4c7]" />
                  Action taken: Added patio heaters, recognized top performer
                </div>
              </div>

              <div className="bg-white border border-[#eaeef3] rounded-2xl p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-[#4257f4]/10 rounded-full flex items-center justify-center mr-4">
                    <Building2 className="w-6 h-6 text-[#4257f4]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#232637]">Medical Clinic</h3>
                    <p className="text-sm text-[#232637]/60">Post-visit feedback</p>
                  </div>
                </div>
                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-[#4257f4]/20" />
                  <p className="text-[#232637]/70 leading-relaxed pl-6">
                    "Patients flagged our check-in wait times as the main frustration. We adjusted staffing and saw our reviews improve within weeks. Fydbak helped us act fast."
                  </p>
                </div>
                <div className="mt-6 flex items-center text-sm text-[#232637]/60">
                  <Star className="w-4 h-4 mr-2 text-[#f6c700]" />
                  Result: Improved online reviews and patient satisfaction
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#4257f4] to-[#3cf4c7]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to transform your feedback?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join teams getting honest answers and actionable insights.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-white text-[#4257f4] hover:bg-white/90 text-lg px-8">
                  Start Free Trial
                </Button>
              </Link>
              <button onClick={scrollToDemo}>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8">
                  Watch Demo
                </Button>
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#eaeef3] py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-[#4257f4] rounded-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-[#232637]">Fydbak</span>
              </div>
              <p className="text-[#232637]/60 mb-6 max-w-md">
                Chat-style feedback for both customers and teams. Get honest insights with AI-powered follow-ups.
              </p>
              <div className="flex items-center space-x-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 border border-[#eaeef3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3cf4c7]"
                />
                <Button className="bg-[#3cf4c7] text-[#232637] hover:bg-[#2dd4ae]">
                  Subscribe
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-[#232637] mb-4">Product</h3>
              <ul className="space-y-2">
                <li><button onClick={scrollToPricing} className="text-[#232637]/60 hover:text-[#4257f4] transition-colors">Pricing</button></li>
                <li><button onClick={scrollToDemo} className="text-[#232637]/60 hover:text-[#4257f4] transition-colors">Demo</button></li>
                <li><Link to="/register" className="text-[#232637]/60 hover:text-[#4257f4] transition-colors">Get Started</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-[#232637] mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-[#232637]/60 hover:text-[#4257f4] transition-colors">Trust & Privacy</Link></li>
                <li><Link to="/terms" className="text-[#232637]/60 hover:text-[#4257f4] transition-colors">Terms</Link></li>
                <li><a href="mailto:hello@fydbak.com" className="text-[#232637]/60 hover:text-[#4257f4] transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#eaeef3] pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-[#232637]/60 text-sm mb-4 md:mb-0">
              &copy; 2025 Fydbak. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-[#232637]/60 hover:text-[#4257f4] text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-[#232637]/60 hover:text-[#4257f4] text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
