'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpIcon, ArrowDownIcon, WalletIcon, TrendingUpIcon, LogOutIcon, PlusIcon, LightbulbIcon } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { TransactionDialog } from '@/components/transaction-dialog';
import { BudgetDialog } from '@/components/budget-dialog';
import { BudgetCard } from '@/components/budget-card';
import { SuggestionCard } from '@/components/suggestion-card';
import { GoalsSection } from '@/components/goals-section';
import { MonthSelector } from '@/components/month-selector';
import { FinancialHealthCard } from '@/components/financial-health-card';
import { SpendingProjectionCard } from '@/components/spending-projection-card';
import Link from 'next/link';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { motion, Variants } from 'framer-motion';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string | null;
  date: string;
  category: { name: string } | null;
}

interface BudgetStatus {
  budgetId: string;
  category: {
    id: string;
    name: string;
    icon?: string | null;
  };
  budgetAmount: number;
  spent: number;
  remaining: number;
  percentage: number;
  alertLevel: 'safe' | 'warning' | 'danger' | 'exceeded';
  message?: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(new Date()));
  const [trends, setTrends] = useState<Array<{ month: string; income: number; expenses: number; balance: number }>>([]);
  const [financialHealth, setFinancialHealth] = useState<{
    score: number;
    breakdown: any;
    projection: {
      amount: number;
      status: string;
      message: string;
      dailyAverage: number;
      daysRemaining: number;
    };
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const fetchTransactions = useCallback(async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      const monthParam = selectedMonth.toISOString();
      const [transactionsRes, trendsRes, budgetStatusRes, financialHealthRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/transactions/trends'),
        fetch(`/api/budgets/status?month=${monthParam}`),
        fetch(`/api/financial-health?month=${monthParam}`),
      ]);

      if (transactionsRes.ok) {
        const data = await transactionsRes.json();
        setTransactions(data.transactions);
      }

      if (trendsRes.ok) {
        const data = await trendsRes.json();
        setTrends(data.trends);
      }

      if (budgetStatusRes.ok) {
        const data = await budgetStatusRes.json();
        setBudgetStatus(data.budgetStatus || []);
      }

      if (financialHealthRes.ok) {
        const data = await financialHealthRes.json();
        setFinancialHealth(data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session, selectedMonth, setIsLoading, setTransactions, setTrends, setBudgetStatus]);

  useEffect(() => {
    if (session) {
      fetchTransactions();
    }
  }, [session, fetchTransactions]);

  if (status === 'loading' || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Filter transactions by selected month
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);

  const filteredTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return transactionDate >= monthStart && transactionDate <= monthEnd;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const categoryTotals = filteredTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      const category = t.category?.name || 'Uncategorized';
      acc[category] = (acc[category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      name: category,
      value: amount,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f97316', '#ec4899'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/20">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <WalletIcon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Budget Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Welcome, <span className="font-medium text-foreground">{session.user?.name || session.user?.email}</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              className="gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOutIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Section */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <motion.div variants={itemVariants}>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground mt-1">Track your finances at a glance</p>
              </motion.div>
              <motion.div className="flex gap-3" variants={itemVariants}>
                <Link href="/insights">
                  <Button
                    variant="outline"
                    className="gap-2 hover:shadow-md transition-all border-primary/20 hover:border-primary/50"
                  >
                    <LightbulbIcon className="h-4 w-4 text-primary" />
                    View Insights
                  </Button>
                </Link>
                <Button
                  className="gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] bg-gradient-to-r from-primary to-primary/80"
                  onClick={() => setDialogOpen(true)}
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Transaction
                </Button>
              </motion.div>
            </div>

            <motion.div className="flex justify-center sm:justify-start" variants={itemVariants}>
              <MonthSelector
                selectedDate={selectedMonth}
                onDateChange={setSelectedMonth}
              />
            </motion.div>
          </div>

          {/* KPI Cards */}
          <motion.div className="grid gap-6 md:grid-cols-3" variants={itemVariants}>
            <Card className="border-border/50 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-primary/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shadow-inner">
                  <WalletIcon className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{balance.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {balance > 0 ? '+' : ''}{((balance / (totalIncome || 1)) * 100).toFixed(1)}% of income remaining
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-green-500/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center shadow-inner">
                  <ArrowUpIcon className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">₹{totalIncome.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">{format(selectedMonth, 'MMMM yyyy')}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-red-500/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shadow-inner">
                  <ArrowDownIcon className="h-5 w-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">₹{totalExpenses.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">{format(selectedMonth, 'MMMM yyyy')}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trends Chart & Goals */}
          <motion.div className="grid gap-6 lg:grid-cols-3" variants={itemVariants}>
            <div className="lg:col-span-2">
              <Card className="border-border/50 shadow-md h-full">
                <CardHeader>
                  <CardTitle>Income vs Expenses</CardTitle>
                  <p className="text-sm text-muted-foreground">6-month financial overview</p>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      income: {
                        label: 'Income',
                        color: 'hsl(142, 76%, 36%)',
                      },
                      expenses: {
                        label: 'Expenses',
                        color: 'hsl(0, 84%, 60%)',
                      },
                    }}
                    className="h-[300px] w-full"
                  >
                    <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        fontSize={12}
                        tickFormatter={(value) => value.slice(0, 3)}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="income"
                        stackId="1"
                        stroke="#22c55e"
                        strokeWidth={2}
                        fill="url(#colorIncome)"
                        animationDuration={1500}
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stackId="2"
                        stroke="#ef4444"
                        strokeWidth={2}
                        fill="url(#colorExpenses)"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <GoalsSection />
            </div>
          </motion.div>

          {/* Comparison Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column: Budgets & Transactions */}
            <motion.div className="space-y-6" variants={itemVariants}>
              <BudgetCard
                budgetStatus={budgetStatus}
                onSetBudget={() => setBudgetDialogOpen(true)}
              />

              <Card className="border-border/50 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUpIcon className="h-5 w-5 text-primary" />
                    Recent Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Spinner className="h-6 w-6" />
                    </div>
                  ) : filteredTransactions.length > 0 ? (
                    <div className="space-y-4">
                      {filteredTransactions.slice(0, 10).map((transaction, index) => (
                        <motion.div
                          key={transaction.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-10 w-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${transaction.type === 'INCOME' ? 'bg-green-500/10' : 'bg-red-500/10'
                                }`}
                            >
                              {transaction.type === 'INCOME' ? (
                                <ArrowUpIcon className="h-5 w-5 text-green-600" />
                              ) : (
                                <ArrowDownIcon className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm group-hover:text-primary transition-colors">
                                {transaction.description || 'No description'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(transaction.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {transaction.category && (
                              <Badge variant="outline" className="hidden sm:inline-flex bg-background hover:bg-muted">
                                {transaction.category.name}
                              </Badge>
                            )}
                            <span
                              className={`font-bold ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                                }`}
                            >
                              {transaction.type === 'INCOME' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No transactions yet</p>
                      <p className="text-sm mt-1">Add your first transaction to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column: Category Breakdown & Suggestions */}
            <motion.div variants={itemVariants} className="space-y-6">

              <Card className="border-border/50 shadow-md h-full">
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Spinner className="h-6 w-6" />
                    </div>
                  ) : categoryData.length > 0 ? (
                    <div className="flex flex-col items-center">
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <ChartTooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-full space-y-3 mt-4">
                        {categoryData.slice(0, 5).map((item, index) => (
                          <div key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                              <span className="text-sm font-medium">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-bold">₹{item.value.toFixed(2)}</span>
                              <span className="text-xs text-muted-foreground w-12 text-right">
                                {totalExpenses > 0 ? Math.round((item.value / totalExpenses) * 100) : 0}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 text-muted-foreground">
                      <div className="h-32 w-32 rounded-full border-4 border-muted/30 mx-auto mb-4 flex items-center justify-center">
                        <span className="text-4xl">📊</span>
                      </div>
                      <p>No expense data yet</p>
                      <p className="text-sm mt-1">Add expenses to see visuals</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchTransactions}
      />

      <BudgetDialog
        open={budgetDialogOpen}
        onOpenChange={setBudgetDialogOpen}
        onSuccess={fetchTransactions}
        selectedMonth={selectedMonth}
      />
    </div>
  );
}
