'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const fetchTransactions = async () => {
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
  };

  useEffect(() => {
    if (session) {
      fetchTransactions();
    }
  }, [session, selectedMonth]);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WalletIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Budget Tracker</h1>
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

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground mt-1">Track your finances at a glance</p>
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
            <Card className="border-border/50 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <WalletIcon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${balance.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {balance > 0 ? '+' : ''}{((balance / totalIncome) * 100).toFixed(1)}% from income
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
                <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <ArrowUpIcon className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">{format(selectedMonth, 'MMMM yyyy')}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                  <ArrowDownIcon className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">{format(selectedMonth, 'MMMM yyyy')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Trends Chart */}
          {trends.length > 0 && (
            <Card className="border-border/50 shadow-md">
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
                    {filteredTransactions.slice(0, 10).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              transaction.type === 'INCOME' ? 'bg-green-500/10' : 'bg-red-500/10'
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
                            className={`font-semibold ${
                              transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {transaction.type === 'INCOME' ? '+' : '-'}${transaction.amount.toFixed(2)}
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

            <Card className="border-border/50 shadow-md">
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
                          <span className="text-muted-foreground">${item.amount.toFixed(2)}</span>
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
