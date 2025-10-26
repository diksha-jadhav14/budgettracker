'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WalletIcon, TrendingUpIcon, PieChartIcon, ShieldCheckIcon, CheckIcon, SparklesIcon, BarChart3Icon, BellIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading' || session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50 backdrop-blur-sm bg-white/90">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                <WalletIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Budget Tracker</h1>
                <p className="text-xs text-gray-500">Smart Money Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                <Link href="/auth/register">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="py-16 sm:py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
              <SparklesIcon className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">Trusted by 10,000+ Users</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
              Take Control of Your
              <span className="block text-indigo-600 mt-2">Financial Future</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10">
              Simple, powerful budget tracking designed for Indians. Track every rupee, achieve every goal, and build the wealth you deserve.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                asChild 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 text-base font-medium shadow-sm"
              >
                <Link href="/auth/register">Start Free Today</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 h-12 text-base font-medium"
              >
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-600" />
                <span>100% Free Forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-600" />
                <span>Bank-Level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-green-600" />
                <span>No Credit Card Required</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-20 bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Master Your Money
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Powerful features designed for simplicity. Track, analyze, and optimize your finances effortlessly.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md">
                <CardContent className="pt-8 pb-8 px-6">
                  <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center mb-6">
                    <TrendingUpIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-xl text-gray-900 mb-3">Smart Tracking</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Snap a photo of your bill and we&apos;ll do the rest. Or enter manually in seconds. Your choice, your control.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md">
                <CardContent className="pt-8 pb-8 px-6">
                  <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center mb-6">
                    <PieChartIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-xl text-gray-900 mb-3">Crystal Clear Insights</h3>
                  <p className="text-gray-600 leading-relaxed">
                    See exactly where every rupee goes. Beautiful charts that make sense. No accounting degree needed.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md">
                <CardContent className="pt-8 pb-8 px-6">
                  <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center mb-6">
                    <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-xl text-gray-900 mb-3">Fort Knox Security</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Bank-grade encryption protects your data. Only you can see your finances. Your privacy, guaranteed.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 sm:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
                  <BarChart3Icon className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-700">Built for India</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                  Stop Living Paycheck to Paycheck
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Join thousands of Indians who&apos;ve taken control of their finances. Start saving for what matters most to you and your family.
                </p>
                <div className="space-y-4 pt-4">
                  {[
                    'Track expenses in rupees - made for India',
                    'Set budgets that actually work for you',
                    'Plan for your dreams, not just bills',
                    'Get actionable insights that help you save more'
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckIcon className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-base text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Card className="border border-gray-200 bg-white shadow-lg p-8">
                  <CardContent className="p-0 space-y-8">
                    <div className="text-center space-y-2 pb-6 border-b border-gray-200">
                      <div className="text-5xl font-bold text-indigo-600">
                        ₹50,000+
                      </div>
                      <p className="text-gray-600 font-medium">Average savings in first year</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center space-y-2 p-4 rounded-lg bg-gray-50">
                        <div className="text-3xl font-bold text-gray-900">10K+</div>
                        <p className="text-sm text-gray-600">Active Users</p>
                      </div>
                      <div className="text-center space-y-2 p-4 rounded-lg bg-gray-50">
                        <div className="text-3xl font-bold text-gray-900">4.9★</div>
                        <p className="text-sm text-gray-600">User Rating</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="py-16 sm:py-20 bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                More Features to Love
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: BellIcon,
                  title: 'Budget Alerts',
                  description: 'Get notified before you overspend on any category'
                },
                {
                  icon: BarChart3Icon,
                  title: 'Detailed Reports',
                  description: 'Monthly insights and trends to improve your spending'
                },
                {
                  icon: TrendingUpIcon,
                  title: 'Goal Tracking',
                  description: 'Set and achieve your savings goals with ease'
                }
              ].map((feature, index) => (
                <div key={index} className="p-6 bg-white rounded-lg border border-gray-200">
                  <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-4">
                    <feature.icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24">
          <div className="max-w-4xl mx-auto">
            <Card className="border border-gray-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg">
              <CardContent className="p-12 text-center space-y-6">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Ready to Take Control of Your Money?
                </h2>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                  Join thousands of smart Indians building their financial future. Start free today with no strings attached.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button 
                    size="lg" 
                    asChild 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 text-base font-medium shadow-sm"
                  >
                    <Link href="/auth/register">Start Your Free Journey</Link>
                  </Button>
                </div>
                <p className="text-sm text-gray-600 pt-2">
                  No credit card required • 100% free forever • Cancel anytime
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <WalletIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-semibold text-gray-900">Budget Tracker</span>
                <p className="text-xs text-gray-500">Smart Money Management</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-600">
                © 2024 Budget Tracker. Made with ❤️ for India
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Built with Next.js & shadcn/ui
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
