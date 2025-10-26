'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WalletIcon, TrendingUpIcon, PieChartIcon, ShieldCheckIcon, CheckIcon, SparklesIcon, BarChart3Icon, BellIcon, ArrowRightIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading' || session) {
    return null;
  }

  const features = [
    { icon: TrendingUpIcon, title: 'Smart Tracking', desc: 'Snap a photo of your bill and we\'ll do the rest. Or enter manually in seconds.' },
    { icon: PieChartIcon, title: 'Crystal Clear Insights', desc: 'See exactly where every rupee goes. Beautiful charts that make sense.' },
    { icon: ShieldCheckIcon, title: 'Fort Knox Security', desc: 'Bank-grade encryption protects your data. Your privacy, guaranteed.' },
  ];

  const benefits = [
    'Track expenses in rupees - made for India',
    'Set budgets that actually work for you',
    'Plan for your dreams, not just bills',
    'Get actionable insights that help you save more'
  ];

  const moreFeatures = [
    { icon: BellIcon, title: 'Budget Alerts', desc: 'Get notified before you overspend on any category' },
    { icon: BarChart3Icon, title: 'Detailed Reports', desc: 'Monthly insights and trends to improve your spending' },
    { icon: TrendingUpIcon, title: 'Goal Tracking', desc: 'Set and achieve your savings goals with ease' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <motion.header 
        className="border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.div 
                className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm"
                whileHover={{ 
                  rotateY: 180,
                  boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.3)"
                }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <WalletIcon className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Budget Tracker</h1>
                <p className="text-xs text-gray-500">Smart Money Management</p>
              </div>
            </motion.div>
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ y: -2 }} 
                whileTap={{ scale: 0.98 }}
              >
                <Button variant="ghost" asChild className="text-gray-700 hover:text-gray-900">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </motion.div>
              <motion.div 
                whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.3)" }} 
                whileTap={{ scale: 0.98 }}
              >
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                  <Link href="/auth/register">Get Started Free</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-16 sm:py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <SparklesIcon className="h-4 w-4 text-indigo-600" />
              </motion.div>
              <span className="text-sm font-medium text-indigo-700">Trusted by 10,000+ Users</span>
            </motion.div>
            
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.span 
                className="block"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Take Control of Your
              </motion.span>
              <motion.span 
                className="block text-indigo-600 mt-2"
                whileHover={{ 
                  scale: 1.02,
                  textShadow: "0 0 20px rgba(99, 102, 241, 0.3)"
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Financial Future
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Simple, powerful budget tracking designed for Indians. Track every rupee, achieve every goal, and build the wealth you deserve.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                whileHover={{ 
                  scale: 1.05, 
                  y: -4,
                  boxShadow: "0 20px 40px -10px rgba(99, 102, 241, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button 
                  size="lg" 
                  asChild 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 text-base font-medium shadow-lg"
                >
                  <Link href="/auth/register" className="flex items-center gap-2">
                    Start Free Today
                    <motion.div
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRightIcon className="h-4 w-4" />
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button 
                  size="lg" 
                  variant="outline" 
                  asChild 
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 h-12 text-base font-medium"
                >
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div 
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {['100% Free Forever', 'Bank-Level Security', 'No Credit Card Required'].map((text, i) => (
                <motion.div 
                  key={i}
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ scale: 1.1, x: 5 }}
                >
                  <motion.div
                    className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center"
                    whileHover={{ 
                      rotate: 360,
                      backgroundColor: "#dcfce7"
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <CheckIcon className="h-3 w-3 text-green-600" />
                  </motion.div>
                  <span>{text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Master Your Money
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Powerful features designed for simplicity. Track, analyze, and optimize your finances effortlessly.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                  onHoverStart={() => setHoveredCard(index)}
                  onHoverEnd={() => setHoveredCard(null)}
                >
                  <motion.div
                    whileHover={{ 
                      y: -10,
                      rotateX: 5,
                      rotateY: 5,
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
                    }}
                    style={{ 
                      transformStyle: "preserve-3d",
                      perspective: 1000
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card className="border border-gray-200 bg-white shadow-sm h-full">
                      <CardContent className="pt-8 pb-8 px-6">
                        <motion.div 
                          className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center mb-6"
                          animate={{
                            rotateY: hoveredCard === index ? 360 : 0,
                          }}
                          transition={{ duration: 0.6 }}
                          style={{ transformStyle: "preserve-3d" }}
                        >
                          <feature.icon className="h-6 w-6 text-indigo-600" />
                        </motion.div>
                        <h3 className="font-semibold text-xl text-gray-900 mb-3">{feature.title}</h3>
                        <p className="text-gray-600 leading-relaxed">
                          {feature.desc}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <motion.div 
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100"
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <BarChart3Icon className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-700">Built for India</span>
                </motion.div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                  Stop Living Paycheck to Paycheck
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Join thousands of Indians who&apos;ve taken control of their finances. Start saving for what matters most to you and your family.
                </p>
                <div className="space-y-4 pt-4">
                  {benefits.map((benefit, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 10, scale: 1.02 }}
                    >
                      <motion.div 
                        className="h-6 w-6 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5"
                        whileHover={{ 
                          rotate: 360,
                          scale: 1.2,
                          backgroundColor: "#dcfce7"
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <CheckIcon className="h-4 w-4 text-green-600" />
                      </motion.div>
                      <span className="text-base text-gray-700">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <motion.div
                  whileHover={{ 
                    scale: 1.02,
                    rotateY: 5,
                    rotateX: 5,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                  }}
                  style={{ 
                    transformStyle: "preserve-3d",
                    perspective: 1000
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="border border-gray-200 bg-white shadow-lg p-8">
                    <CardContent className="p-0 space-y-8">
                      <div className="text-center space-y-2 pb-6 border-b border-gray-200">
                        <motion.div 
                          className="text-5xl font-bold text-indigo-600"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          ₹50,000+
                        </motion.div>
                        <p className="text-gray-600 font-medium">Average savings in first year</p>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <motion.div 
                          className="text-center space-y-2 p-4 rounded-lg bg-gray-50"
                          whileHover={{ 
                            scale: 1.05,
                            y: -5,
                            backgroundColor: "#f9fafb",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                          }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <div className="text-3xl font-bold text-gray-900">10K+</div>
                          <p className="text-sm text-gray-600">Active Users</p>
                        </motion.div>
                        <motion.div 
                          className="text-center space-y-2 p-4 rounded-lg bg-gray-50"
                          whileHover={{ 
                            scale: 1.05,
                            y: -5,
                            backgroundColor: "#f9fafb",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                          }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <div className="text-3xl font-bold text-gray-900">4.9★</div>
                          <p className="text-sm text-gray-600">User Rating</p>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                More Features to Love
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {moreFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                  whileHover={{ 
                    y: -8,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                  }}
                >
                  <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm h-full">
                    <motion.div 
                      className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-4"
                      whileHover={{ 
                        rotateY: 180,
                        backgroundColor: "#eef2ff"
                      }}
                      transition={{ duration: 0.6 }}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <feature.icon className="h-5 w-5 text-indigo-600" />
                    </motion.div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <motion.div
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Card className="border border-gray-200 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg">
                  <CardContent className="p-12 text-center space-y-6">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                      Ready to Take Control of Your Money?
                    </h2>
                    <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                      Join thousands of smart Indians building their financial future. Start free today with no strings attached.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                      <motion.div
                        whileHover={{ 
                          scale: 1.05,
                          y: -4,
                          boxShadow: "0 20px 40px -10px rgba(99, 102, 241, 0.4)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Button 
                          size="lg" 
                          asChild 
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 text-base font-medium shadow-lg"
                        >
                          <Link href="/auth/register">Start Your Free Journey</Link>
                        </Button>
                      </motion.div>
                    </div>
                    <p className="text-sm text-gray-600 pt-2">
                      No credit card required • 100% free forever • Cancel anytime
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center"
                whileHover={{ 
                  rotateY: 180,
                  boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.3)"
                }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <WalletIcon className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <span className="font-semibold text-gray-900">Budget Tracker</span>
                <p className="text-xs text-gray-500">Smart Money Management</p>
              </div>
            </motion.div>
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
