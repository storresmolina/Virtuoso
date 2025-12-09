import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import './Settings.css'

interface Plan {
  id: string
  name: string
  price: string
  priceMonthly: number | null
  description: string
  features: string[]
  highlighted?: boolean
  buttonText: string
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    priceMonthly: 0,
    description: 'Perfect for private instruction',
    features: [
      '1 student per classroom',
      'Unlimited classrooms',
      'Basic document sharing',
      'Student practice logs',
      'Notebook system',
      'Email support'
    ],
    buttonText: 'Current Plan'
  },
  {
    id: 'basic',
    name: 'Basic',
    price: '$10',
    priceMonthly: 10,
    description: 'Great for small group lessons',
    features: [
      'Up to 5 students per classroom',
      'Unlimited classrooms',
      'Advanced document management',
      'Student progress tracking',
      'Practice session analytics',
      'Priority email support',
      'Classroom codes management'
    ],
    buttonText: 'Upgrade to Basic',
    highlighted: false
  },
  {
    id: 'advanced',
    name: 'Advanced',
    price: '$30',
    priceMonthly: 30,
    description: 'Ideal for professional instructors',
    features: [
      'Up to 20 students per classroom',
      'Unlimited classrooms',
      'AI-powered practice analysis ✨',
      'Advanced performance insights',
      'Custom practice assignments',
      'Video feedback tools',
      'Detailed progress reports',
      'Priority support with live chat',
      'Custom branding options'
    ],
    buttonText: 'Upgrade to Advanced',
    highlighted: true
  },
  {
    id: 'business',
    name: 'Business',
    price: 'Custom',
    priceMonthly: null,
    description: 'For music schools and institutions',
    features: [
      'Unlimited students per classroom',
      'Unlimited classrooms',
      'Everything in Advanced, plus:',
      'Multi-instructor management',
      'School-wide analytics dashboard',
      'Custom integrations & API access',
      'White-label options',
      'Dedicated account manager',
      'Custom training & onboarding',
      '99.9% uptime SLA'
    ],
    buttonText: 'Contact Sales',
    highlighted: false
  }
]

export const Subscription: React.FC = () => {
  const { getTierInfo } = useAuth()
  const [currentTier, setCurrentTier] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    loadTier()
  }, [])

  async function loadTier() {
    setLoading(true)
    try {
      const tier = await getTierInfo()
      setCurrentTier(tier)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = (planId: string) => {
    if (planId === 'business') {
      window.location.href = 'mailto:sales@virtuoso.app?subject=Business Plan Inquiry'
    } else {
      // TODO: Integrate with payment processor (Stripe, etc.)
      alert(`Upgrade to ${planId} - Payment integration coming soon!`)
    }
  }

  if (loading) {
    return <div style={{ padding: 24 }}>Loading subscription details...</div>
  }

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{
          fontSize: '2rem',
          fontFamily: 'var(--font-title)',
          fontStyle: 'italic',
          marginBottom: 8
        }}>
          Subscription Plans
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Choose the plan that fits your teaching needs
        </p>
      </div>

      {/* Current Plan Banner */}
      {currentTier && (
        <div style={{
          marginBottom: 32,
          padding: 20,
          background: 'var(--bg-secondary)',
          borderRadius: 12,
          border: '2px solid var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
              Your Current Plan
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentTier.name}
              {currentTier.price_monthly > 0 && (
                <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 12 }}>
                  ${currentTier.price_monthly}/month
                </span>
              )}
            </div>
            {currentTier.max_students !== null && (
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                {currentTier.max_students} {currentTier.max_students === 1 ? 'student' : 'students'} per classroom
                {currentTier.ai_analysis_enabled && ' • AI Analysis Enabled ✨'}
              </div>
            )}
          </div>
          {currentTier.name === 'Free' && (
            <button
              className="primary-btn"
              style={{ padding: '10px 24px' }}
              onClick={() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Upgrade Now
            </button>
          )}
        </div>
      )}

      {/* Billing Cycle Toggle */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 32,
        gap: 16,
        alignItems: 'center'
      }}>
        <button
          className={billingCycle === 'monthly' ? 'primary-btn' : 'btn-secondary'}
          onClick={() => setBillingCycle('monthly')}
          style={{ padding: '8px 20px' }}
        >
          Monthly
        </button>
        <button
          className={billingCycle === 'yearly' ? 'primary-btn' : 'btn-secondary'}
          onClick={() => setBillingCycle('yearly')}
          style={{ padding: '8px 20px' }}
        >
          Yearly
        </button>
        <span style={{
          fontSize: '0.85rem',
          color: 'var(--accent-primary)',
          fontWeight: 600,
          padding: '4px 12px',
          background: 'rgba(164, 149, 100, 0.1)',
          borderRadius: 20
        }}>
          Save 20% with yearly
        </span>
      </div>

      {/* Plans Grid */}
      <div id="plans-section" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
        marginBottom: 48
      }}>
        {plans.map(plan => {
          const isCurrentPlan = currentTier?.name === plan.name
          const displayPrice = billingCycle === 'yearly' && plan.priceMonthly
            ? `$${Math.floor(plan.priceMonthly * 12 * 0.8)}`
            : plan.price

          return (
            <div
              key={plan.id}
              style={{
                background: plan.highlighted ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                borderRadius: 16,
                border: plan.highlighted ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                padding: 28,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                boxShadow: plan.highlighted ? '0 8px 24px rgba(164, 149, 100, 0.2)' : 'none'
              }}
            >
              {plan.highlighted && (
                <div style={{
                  position: 'absolute',
                  top: -12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--lacquer)',
                  color: 'var(--ivory)',
                  padding: '4px 16px',
                  borderRadius: 20,
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}>
                  Most Popular
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontFamily: 'var(--font-title)',
                  fontStyle: 'italic',
                  marginBottom: 8,
                  color: plan.highlighted ? 'var(--lacquer)' : 'var(--text-primary)'
                }}>
                  {plan.name}
                </h3>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  marginBottom: 8,
                  color: plan.highlighted ? 'var(--lacquer)' : 'var(--text-primary)'
                }}>
                  {displayPrice}
                  {plan.priceMonthly !== null && (
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: 400,
                      color: plan.highlighted ? 'var(--pressed-ivory)' : 'var(--text-secondary)'
                    }}>
                      /{billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  )}
                </div>
                <p style={{
                  fontSize: '0.9rem',
                  color: plan.highlighted ? 'var(--pressed-ivory)' : 'var(--text-secondary)',
                  marginBottom: 0
                }}>
                  {plan.description}
                </p>
              </div>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                marginBottom: 24,
                flex: 1
              }}>
                {plan.features.map((feature, idx) => (
                  <li key={idx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    marginBottom: 12,
                    fontSize: '0.9rem',
                    color: plan.highlighted ? 'var(--lacquer)' : 'var(--text-primary)'
                  }}>
                    <span style={{ color: plan.highlighted ? 'var(--lacquer)' : 'var(--accent-primary)', fontSize: '1.1rem' }}>
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={isCurrentPlan ? 'btn-secondary' : 'primary-btn'}
                disabled={isCurrentPlan}
                onClick={() => handleUpgrade(plan.id)}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '1rem',
                  opacity: isCurrentPlan ? 0.6 : 1,
                  cursor: isCurrentPlan ? 'not-allowed' : 'pointer',
                  background: plan.highlighted && !isCurrentPlan ? 'var(--lacquer)' : undefined,
                  color: plan.highlighted && !isCurrentPlan ? 'var(--ivory)' : undefined
                }}
              >
                {isCurrentPlan ? 'Current Plan' : plan.buttonText}
              </button>
            </div>
          )
        })}
      </div>

      {/* FAQ Section */}
      <div style={{
        padding: 32,
        background: 'var(--bg-secondary)',
        borderRadius: 12,
        border: '1px solid var(--border-color)'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontFamily: 'var(--font-title)',
          fontStyle: 'italic',
          marginBottom: 24,
          textAlign: 'center'
        }}>
          Frequently Asked Questions
        </h3>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <FAQItem
            question="Can I change plans at any time?"
            answer="Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges."
          />
          <FAQItem
            question="What happens if I exceed my student limit?"
            answer="You'll be prompted to upgrade your plan. Students won't be able to join new classrooms until you upgrade or remove students from existing classrooms."
          />
          <FAQItem
            question="Is there a discount for yearly billing?"
            answer="Yes! Annual subscriptions save 20% compared to monthly billing. That's 2+ months free!"
          />
          <FAQItem
            question="What payment methods do you accept?"
            answer="We accept all major credit cards (Visa, Mastercard, American Express, Discover) and PayPal for subscription payments."
          />
        </div>
      </div>
    </div>
  )
}

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      marginBottom: 16,
      padding: 16,
      background: 'var(--bg-primary)',
      borderRadius: 8,
      border: '1px solid var(--border-color)'
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          textAlign: 'left',
          color: 'var(--text-primary)',
          fontSize: '1rem',
          fontWeight: 600
        }}
      >
        {question}
        <span style={{ fontSize: '1.2rem' }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <p style={{
          marginTop: 12,
          marginBottom: 0,
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          lineHeight: 1.6
        }}>
          {answer}
        </p>
      )}
    </div>
  )
}
