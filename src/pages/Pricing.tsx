import { Link } from 'react-router-dom';
import { MessageSquare, Check, X, DollarSign, Shield, Zap, HelpCircle, ArrowRight, BarChart3, FileDown, Star } from 'lucide-react';
import { Button } from '../components/shared/Button';
import { SEO } from '../components/shared/SEO';

export function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for trying out FydBak',
      popular: false,
      cta: 'Start Free',
      ctaVariant: 'outline' as const,
      features: [
        '1 active survey at a time',
        'Up to 5 unique rep responses/month',
        'AI summaries for up to 5 responses',
        'Basic analytics',
        'Email support',
        'No credit card required'
      ],
      limitations: [
        'Multiple surveys at once',
        'Advanced analytics',
        'CSV export',
        'Priority support'
      ]
    },
    {
      name: 'Pro',
      price: 15,
      period: 'month',
      description: 'For active managers and small teams',
      popular: true,
      cta: 'Upgrade to Pro',
      ctaVariant: 'primary' as const,
      features: [
        'Unlimited surveys',
        'Up to 50 rep responses/month',
        'AI summaries for all responses',
        'Advanced analytics dashboard',
        'Priority support',
        'Usage resets monthly',
        'Real-time usage tracking'
      ],
      limitations: [
        'CSV export',
        'Early access to features'
      ]
    },
    {
      name: 'Pro Plus',
      price: 29,
      period: 'month',
      description: 'Everything you need to scale',
      popular: false,
      cta: 'Get Pro Plus',
      ctaVariant: 'primary' as const,
      features: [
        'Unlimited surveys',
        'Unlimited rep responses',
        'Unlimited AI summaries & insights',
        'CSV export & analytics dashboard',
        'Priority support',
        'Early access to new features',
        'Real-time usage tracking',
        'Advanced reporting'
      ],
      limitations: []
    }
  ];

  const comparisonFeatures = [
    { feature: 'Active Surveys', free: '1 at a time', pro: 'Unlimited', proPlus: 'Unlimited' },
    { feature: 'Monthly Responses', free: '5', pro: '50', proPlus: 'Unlimited' },
    { feature: 'AI Summaries', free: '5/month', pro: 'All responses', proPlus: 'Unlimited' },
    { feature: 'Analytics Dashboard', free: false, pro: true, proPlus: true },
    { feature: 'CSV Export', free: false, pro: false, proPlus: true },
    { feature: 'Priority Support', free: false, pro: true, proPlus: true },
    { feature: 'Early Access Features', free: false, pro: false, proPlus: true },
    { feature: 'Real-time Usage Tracking', free: false, pro: true, proPlus: true }
  ];

  const faqs = [
    {
      question: 'What happens if I exceed my plan limit?',
      answer: 'If you exceed your monthly response limit, you\'ll be charged $0.25 per additional response (including AI summary). You can monitor your usage in real-time from your dashboard.'
    },
    {
      question: 'Can I change plans anytime?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any charges.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'The Free plan is available forever with no credit card required. You can upgrade to a paid plan whenever you need more capacity.'
    },
    {
      question: 'How does billing work?',
      answer: 'All plans are billed monthly in USD. Your usage resets at the start of each billing cycle. Overages are billed at the end of the cycle.'
    },
    {
      question: 'What counts as a response?',
      answer: 'Each completed survey session counts as one response, regardless of how many questions it contains. Abandoned surveys don\'t count toward your limit.'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Absolutely! You can cancel your subscription at any time with no questions asked. You\'ll retain access until the end of your billing period.'
    }
  ];

  return (
    <>
      <SEO
        title="FydBak Pricing | Affordable AI-Powered Team Feedback Software"
        description="FydBak pricing starts free with 5 responses per month. Pro plan at $15/month (50 responses) and Pro Plus at $29/month (unlimited). AI-powered conversational surveys for retail, sales, and frontline teams."
        keywords="FydBak pricing, team feedback software cost, AI survey tool pricing, Google Forms alternative pricing, employee feedback tool cost"
        canonical="https://fydbak.com/pricing"
      />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">FydBak</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-4">
              Choose the plan that fits your team size. Scale as you grow with usage-based pricing.
            </p>
            <p className="text-sm text-slate-500">
              All prices in USD · Billed monthly · Cancel anytime
            </p>
          </div>
        </section>

        <section className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`
                    relative bg-white rounded-2xl border-2 p-8 flex flex-col
                    ${plan.popular
                      ? 'border-blue-500 shadow-xl scale-105'
                      : 'border-slate-200 hover:border-blue-300 hover:shadow-lg'
                    }
                    transition-all
                  `}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                    <p className="text-slate-600 text-sm mb-4">{plan.description}</p>
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-slate-900">${plan.price}</span>
                      <span className="text-slate-600 ml-2">/{plan.period}</span>
                    </div>
                  </div>

                  <Link to="/register" className="mb-6">
                    <Button
                      variant={plan.ctaVariant}
                      className="w-full"
                      size="lg"
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>

                  <div className="space-y-4 flex-1">
                    <div className="space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start">
                          <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {plan.limitations.length > 0 && (
                      <div className="pt-4 border-t border-slate-200 space-y-3">
                        {plan.limitations.map((limitation) => (
                          <div key={limitation} className="flex items-start">
                            <X className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-500 text-sm">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Compare All Features
              </h2>
              <p className="text-slate-600">
                See exactly what's included in each plan
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-4 px-6 text-slate-900 font-semibold">Feature</th>
                    <th className="text-center py-4 px-6 text-slate-900 font-semibold">Free</th>
                    <th className="text-center py-4 px-6 text-slate-900 font-semibold bg-blue-50">Pro</th>
                    <th className="text-center py-4 px-6 text-slate-900 font-semibold">Pro Plus</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((item, index) => (
                    <tr
                      key={item.feature}
                      className={`border-b border-slate-100 ${index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}
                    >
                      <td className="py-4 px-6 text-slate-700 font-medium">{item.feature}</td>
                      <td className="py-4 px-6 text-center">
                        {typeof item.free === 'boolean' ? (
                          item.free ? (
                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-slate-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-slate-700">{item.free}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center bg-blue-50">
                        {typeof item.pro === 'boolean' ? (
                          item.pro ? (
                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-slate-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-slate-700 font-medium">{item.pro}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {typeof item.proPlus === 'boolean' ? (
                          item.proPlus ? (
                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-slate-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-slate-700">{item.proPlus}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 to-slate-800">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <DollarSign className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Usage-Based Pricing
              </h2>
              <p className="text-slate-300">
                Simple and transparent overage pricing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Pay As You Grow</h3>
                <p className="text-slate-300 text-sm">
                  Only $0.25 per response over your plan limit. Includes AI summary and analysis.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Real-Time Tracking</h3>
                <p className="text-slate-300 text-sm">
                  Monitor your usage in real-time from your dashboard. Never be surprised by your bill.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Monthly Reset</h3>
                <p className="text-slate-300 text-sm">
                  Your usage limit resets every month. Overages are billed at the end of each cycle.
                </p>
              </div>
            </div>

            <div className="mt-8 bg-blue-600/20 border border-blue-400/30 rounded-xl p-6">
              <div className="flex items-start">
                <Shield className="w-6 h-6 text-blue-400 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-white font-semibold mb-2">Pricing Per Manager Account</h4>
                  <p className="text-slate-300 text-sm">
                    Plans are per manager account, not per rep. Invite unlimited team members to respond to your surveys at no extra cost.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-600">
                Everything you need to know about pricing
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.question} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{faq.question}</h3>
                  <p className="text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-green-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Start with the Free plan. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 w-full sm:w-auto">
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">FydBak</span>
          </div>
          <p className="text-slate-600 text-sm">
            Conversational feedback for distributed teams
          </p>
          <p className="text-slate-500 text-xs mt-4">
            &copy; 2025 FydBak. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
    </>
  );
}
