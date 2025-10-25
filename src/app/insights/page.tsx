'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { startOfMonth, format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon,
  ArrowLeftIcon,
  PiggyBankIcon,
  CalendarIcon,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { MonthSelector } from '@/components/month-selector';
import Link from 'next/link';
import type { BudgetAnalysis } from '@/lib/budget-insights';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, Legend } from 'recharts';

export default function InsightsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [analysis, setAnalysis] = useState<BudgetAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(new Date()));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const fetchInsights = async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      const monthStr = format(selectedMonth, 'yyyy-MM');
      const response = await fetch(`/api/insights?month=${monthStr}`);
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangleIcon className="h-5 w-5 text-orange-600" />;
      case 'info':
        return <InfoIcon className="h-5 w-5 text-blue-600" />;
      default:
        return <InfoIcon className="h-5 w-5" />;
    }
  };

  const getInsightBadgeVariant = (type: string) => {
    switch (type) {
      case 'success':
        return 'default';
      case 'warning':
        return 'destructive';
      case 'info':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <PiggyBankIcon className="h-8 w-8 text-primary" />
                  Budget Insights
                </h1>
                <p className="text-muted-foreground mt-1">
                  Get personalized spending insights and suggestions
                </p>
              </div>
            </div>
            
            <div className="flex justify-center sm:justify-start">
              <MonthSelector 
                selectedDate={selectedMonth}
                onDateChange={setSelectedMonth}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner className="h-8 w-8" />
            </div>
          ) : analysis ? (
            <>
              {/* Monthly Comparison */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border/50 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-primary" />
                      {analysis.currentMonth.month}
                    </CardTitle>
                    <CardDescription>Current month summary</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Income</span>
                        <span className="font-semibold text-green-600">
                          ${analysis.currentMonth.income.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Expenses</span>
                        <span className="font-semibold text-red-600">
                          ${analysis.currentMonth.expenses.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t">
                        <span className="font-medium">Balance</span>
                        <span
                          className={`font-bold ${
                            analysis.currentMonth.balance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          ${analysis.currentMonth.balance.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Savings Rate</span>
                        <span className="font-semibold">
                          {analysis.savingsRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={Math.max(0, Math.min(100, analysis.savingsRate))} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                      {analysis.previousMonth.month}
                    </CardTitle>
                    <CardDescription>Previous month summary</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Income</span>
                        <span className="font-semibold text-green-600">
                          ${analysis.previousMonth.income.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Expenses</span>
                        <span className="font-semibold text-red-600">
                          ${analysis.previousMonth.expenses.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t">
                        <span className="font-medium">Balance</span>
                        <span
                          className={`font-bold ${
                            analysis.previousMonth.balance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          ${analysis.previousMonth.balance.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground">
                        {analysis.previousMonth.transactionCount} transactions
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Comparison Chart */}
              <Card className="border-border/50 shadow-md">
                <CardHeader>
                  <CardTitle>Monthly Comparison</CardTitle>
                  <CardDescription>Income vs Expenses comparison</CardDescription>
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
                    <BarChart
                      data={[
                        {
                          month: analysis.previousMonth.month,
                          income: analysis.previousMonth.income,
                          expenses: analysis.previousMonth.expenses,
                        },
                        {
                          month: analysis.currentMonth.month,
                          income: analysis.currentMonth.income,
                          expenses: analysis.currentMonth.expenses,
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="income" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Insights & Suggestions */}
              <Card className="border-border/50 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUpIcon className="h-5 w-5 text-primary" />
                    Personalized Insights
                  </CardTitle>
                  <CardDescription>
                    Based on your spending patterns and habits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysis.insights.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {analysis.insights.map((insight, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg border border-border/50 bg-muted/20 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              {getInsightIcon(insight.type)}
                              <h3 className="font-semibold text-sm">{insight.title}</h3>
                            </div>
                            {insight.value && (
                              <Badge variant={getInsightBadgeVariant(insight.type)} className="text-xs">
                                {insight.value}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{insight.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No insights available yet</p>
                      <p className="text-sm mt-1">
                        Add more transactions to get personalized insights
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Category Spending */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-border/50 shadow-md">
                  <CardHeader>
                    <CardTitle>Category Breakdown</CardTitle>
                    <CardDescription>Where your money goes this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analysis.categorySpending.length > 0 ? (
                      <div className="space-y-4">
                        {analysis.categorySpending.slice(0, 5).map((category) => (
                          <div key={category.category} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{category.category}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({category.transactionCount} transactions)
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">
                                  ${category.amount.toFixed(2)}
                                </span>
                                <span className="text-xs font-medium">
                                  {category.percentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <Progress value={category.percentage} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No expense data yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-md">
                  <CardHeader>
                    <CardTitle>Spending Distribution</CardTitle>
                    <CardDescription>Visual breakdown by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analysis.categorySpending.length > 0 ? (
                      <ChartContainer
                        config={{
                          amount: {
                            label: 'Amount',
                          },
                        }}
                        className="h-[300px]"
                      >
                        <PieChart>
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                labelFormatter={(value) => {
                                  const item = analysis.categorySpending.find(
                                    (c) => c.category === value
                                  );
                                  return `${value}: $${item?.amount.toFixed(2) || 0}`;
                                }}
                              />
                            }
                          />
                          <Pie
                            data={analysis.categorySpending.slice(0, 8)}
                            dataKey="amount"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => `${entry.percentage.toFixed(0)}%`}
                          >
                            {analysis.categorySpending.slice(0, 8).map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={`hsl(${(index * 360) / 8}, 70%, 60%)`}
                              />
                            ))}
                          </Pie>
                          <Legend />
                        </PieChart>
                      </ChartContainer>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No expense data yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Spending Trends */}
              <Card className="border-border/50 shadow-md">
                <CardHeader>
                  <CardTitle>Spending Trends</CardTitle>
                  <CardDescription>
                    Category-wise comparison with previous month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysis.spendingTrends.length > 0 ? (
                    <div className="space-y-3">
                      {analysis.spendingTrends.slice(0, 8).map((trend) => (
                        <div
                          key={trend.category}
                          className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{trend.category}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span>Prev: ${trend.previousMonth.toFixed(2)}</span>
                              <span>→</span>
                              <span>Now: ${trend.currentMonth.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {trend.changePercentage > 0 ? (
                              <>
                                <TrendingUpIcon className="h-4 w-4 text-red-600" />
                                <span className="text-sm font-semibold text-red-600">
                                  +{trend.changePercentage.toFixed(1)}%
                                </span>
                              </>
                            ) : trend.changePercentage < 0 ? (
                              <>
                                <TrendingDownIcon className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-semibold text-green-600">
                                  {trend.changePercentage.toFixed(1)}%
                                </span>
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground">No change</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No trend data available yet</p>
                      <p className="text-sm mt-1">
                        Track expenses for at least 2 months to see trends
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Failed to load insights</p>
              <Button onClick={fetchInsights} className="mt-4">
                Retry
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
