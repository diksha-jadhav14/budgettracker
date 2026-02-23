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
import { MonthSelector } from '@/components/month-selector';
import Link from 'next/link';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

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
  const [dailyAdvice, setDailyAdvice] = useState<string>('');

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
      const [transactionsRes, trendsRes, budgetStatusRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/transactions/trends'),
        fetch(`/api/budgets/status?month=${monthParam}`),
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
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session, selectedMonth, setIsLoading, setTransactions, setTrends, setBudgetStatus]);

  useEffect(() => {
    if (session) {
      fetchTransactions();

      // Fetch financial advice on mount
      fetch('/api/advice')
        .then(res => res.json())
        .then(data => {
          if (data.advice) setDailyAdvice(data.advice);
        })
        .catch(err => console.error("Error fetching advice:", err));
    }
  }, [session, fetchTransactions]);

  if (status === 'loading' || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
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
      category,
      amount,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      {/* Background Ambient Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-pink-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[128px] opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <header className="glass z-10 border-b border-border/40 sticky top-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <WalletIcon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary to-purple-500">Budget Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Welcome, <span className="font-medium text-foreground">{session.user?.name || session.user?.email}</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              className="gap-2"
            >
              <LogOutIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="space-y-8">
          {dailyAdvice && (
            <div className="glass-panel p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="p-2 bg-primary/10 rounded-full shrink-0">
                <LightbulbIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary">Daily Fin-Tip</p>
                <p className="text-sm text-muted-foreground">{dailyAdvice}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-4xl font-extrabold tracking-tight mb-2">Dashboard</h2>
                <p className="text-muted-foreground text-lg">Track your finances elegantly</p>
              </div>
              <div className="flex gap-3">
                <Link href="/insights">
                  <Button
                    variant="outline"
                    className="gap-2 hover:shadow-md transition-all"
                  >
                    <LightbulbIcon className="h-4 w-4" />
                    View Insights
                  </Button>
                </Link>
                <Button
                  className="gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                  onClick={() => setDialogOpen(true)}
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Transaction
                </Button>
              </div>
            </div>

            <div className="flex justify-center sm:justify-start">
              <MonthSelector
                selectedDate={selectedMonth}
                onDateChange={setSelectedMonth}
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="glass-panel overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 backdrop-blur-md">
                  <WalletIcon className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">₹{balance.toFixed(2)}</div>
                <p className="text-xs font-medium text-muted-foreground mt-2 flex items-center gap-1">
                  <span className={balance > 0 ? "text-green-500" : "text-red-500"}>
                    {balance > 0 ? '+' : ''}{((balance / totalIncome) * 100 || 0).toFixed(1)}%
                  </span>
                  from income
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel overflow-hidden hover:shadow-2xl hover:shadow-green-500/5 transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 backdrop-blur-md">
                  <ArrowUpIcon className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-500">₹{totalIncome.toFixed(2)}</div>
                <p className="text-xs font-medium text-muted-foreground mt-2">{format(selectedMonth, 'MMMM yyyy')}</p>
              </CardContent>
            </Card>

            <Card className="glass-panel overflow-hidden hover:shadow-2xl hover:shadow-red-500/5 transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 backdrop-blur-md">
                  <ArrowDownIcon className="h-5 w-5 text-red-600 dark:text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-500">₹{totalExpenses.toFixed(2)}</div>
                <p className="text-xs font-medium text-muted-foreground mt-2">{format(selectedMonth, 'MMMM yyyy')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Trends Chart */}
          {trends.length > 0 && (
            <Card className="glass-panel overflow-hidden shadow-xl shadow-primary/5">
              <CardHeader>
                <CardTitle>6-Month Trend</CardTitle>
                <p className="text-sm text-muted-foreground">Income and expenses over time</p>
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
                  className="h-[300px]"
                >
                  <AreaChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stackId="1"
                      stroke="hsl(142, 76%, 36%)"
                      fill="hsl(142, 76%, 36%)"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stackId="2"
                      stroke="hsl(0, 84%, 60%)"
                      fill="hsl(0, 84%, 60%)"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <BudgetCard
              budgetStatus={budgetStatus}
              onSetBudget={() => setBudgetDialogOpen(true)}
            />

            <Card className="glass-panel shadow-xl shadow-primary/5">
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
                    {filteredTransactions.slice(0, 10).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-background/50 hover:bg-muted/80 backdrop-blur-md transition-all hover:scale-[1.01]"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`h-12 w-12 rounded-xl border flex items-center justify-center shadow-sm ${transaction.type === 'INCOME'
                              ? 'bg-green-500/10 border-green-500/20'
                              : 'bg-red-500/10 border-red-500/20'
                              }`}
                          >
                            {transaction.type === 'INCOME' ? (
                              <ArrowUpIcon className="h-4 w-4 text-green-600" />
                            ) : (
                              <ArrowDownIcon className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {transaction.description || 'No description'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {transaction.category && (
                            <Badge variant="outline" className="hidden sm:inline-flex">
                              {transaction.category.name}
                            </Badge>
                          )}
                          <span
                            className={`font-semibold ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                              }`}
                          >
                            {transaction.type === 'INCOME' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
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

            <Card className="glass-panel shadow-xl shadow-primary/5">
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Spinner className="h-6 w-6" />
                  </div>
                ) : categoryData.length > 0 ? (
                  <div className="space-y-4">
                    {categoryData.map((item, index) => (
                      <div key={item.category} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{item.category}</span>
                          <span className="text-muted-foreground">₹{item.amount.toFixed(2)}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colors[index % colors.length]} transition-all duration-500 ease-out`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No expense data yet</p>
                    <p className="text-sm mt-1">Add expenses to see category breakdown</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
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
