import { Transaction } from '@prisma/client';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  transactionCount: number;
}

interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

interface SpendingTrend {
  category: string;
  currentMonth: number;
  previousMonth: number;
  change: number;
  changePercentage: number;
}

interface BudgetInsight {
  type: 'warning' | 'success' | 'info';
  title: string;
  message: string;
  value?: string;
}

export interface BudgetAnalysis {
  currentMonth: MonthlyData;
  previousMonth: MonthlyData;
  categorySpending: CategorySpending[];
  spendingTrends: SpendingTrend[];
  insights: BudgetInsight[];
  savingsRate: number;
}

export function analyzeTransactions(
  transactions: (Transaction & { category: { name: string } | null })[],
  targetMonth?: Date
): BudgetAnalysis {
  const now = targetMonth || new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));

  const currentMonthTransactions = transactions.filter(
    (t) => new Date(t.date) >= currentMonthStart && new Date(t.date) <= currentMonthEnd
  );

  const previousMonthTransactions = transactions.filter(
    (t) => new Date(t.date) >= previousMonthStart && new Date(t.date) <= previousMonthEnd
  );

  const currentMonth = calculateMonthlyData(currentMonthTransactions, format(now, 'MMMM yyyy'));
  const previousMonth = calculateMonthlyData(previousMonthTransactions, format(subMonths(now, 1), 'MMMM yyyy'));

  const categorySpending = calculateCategorySpending(currentMonthTransactions);
  const spendingTrends = calculateSpendingTrends(currentMonthTransactions, previousMonthTransactions);
  const insights = generateInsights(currentMonth, previousMonth, categorySpending, spendingTrends);
  const savingsRate = currentMonth.income > 0 ? (currentMonth.balance / currentMonth.income) * 100 : 0;

  return {
    currentMonth,
    previousMonth,
    categorySpending,
    spendingTrends,
    insights,
    savingsRate,
  };
}

function calculateMonthlyData(
  transactions: (Transaction & { category: { name: string } | null })[],
  monthName: string
): MonthlyData {
  const income = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    month: monthName,
    income,
    expenses,
    balance: income - expenses,
    transactionCount: transactions.length,
  };
}

function calculateCategorySpending(
  transactions: (Transaction & { category: { name: string } | null })[]
): CategorySpending[] {
  const expenseTransactions = transactions.filter((t) => t.type === 'EXPENSE');
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  const categoryMap = new Map<string, { amount: number; count: number }>();

  expenseTransactions.forEach((t) => {
    const category = t.category?.name || 'Uncategorized';
    const current = categoryMap.get(category) || { amount: 0, count: 0 };
    categoryMap.set(category, {
      amount: current.amount + t.amount,
      count: current.count + 1,
    });
  });

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
      transactionCount: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);
}

function calculateSpendingTrends(
  currentTransactions: (Transaction & { category: { name: string } | null })[],
  previousTransactions: (Transaction & { category: { name: string } | null })[]
): SpendingTrend[] {
  const currentExpenses = currentTransactions.filter((t) => t.type === 'EXPENSE');
  const previousExpenses = previousTransactions.filter((t) => t.type === 'EXPENSE');

  const currentCategoryMap = new Map<string, number>();
  const previousCategoryMap = new Map<string, number>();

  currentExpenses.forEach((t) => {
    const category = t.category?.name || 'Uncategorized';
    currentCategoryMap.set(category, (currentCategoryMap.get(category) || 0) + t.amount);
  });

  previousExpenses.forEach((t) => {
    const category = t.category?.name || 'Uncategorized';
    previousCategoryMap.set(category, (previousCategoryMap.get(category) || 0) + t.amount);
  });

  const allCategories = new Set([...currentCategoryMap.keys(), ...previousCategoryMap.keys()]);

  return Array.from(allCategories)
    .map((category) => {
      const currentMonth = currentCategoryMap.get(category) || 0;
      const previousMonth = previousCategoryMap.get(category) || 0;
      const change = currentMonth - previousMonth;
      const changePercentage = previousMonth > 0 ? (change / previousMonth) * 100 : currentMonth > 0 ? 100 : 0;

      return {
        category,
        currentMonth,
        previousMonth,
        change,
        changePercentage,
      };
    })
    .sort((a, b) => Math.abs(b.changePercentage) - Math.abs(a.changePercentage));
}

function generateInsights(
  currentMonth: MonthlyData,
  previousMonth: MonthlyData,
  categorySpending: CategorySpending[],
  spendingTrends: SpendingTrend[]
): BudgetInsight[] {
  const insights: BudgetInsight[] = [];

  // Savings rate insight
  if (currentMonth.income > 0) {
    const savingsRate = (currentMonth.balance / currentMonth.income) * 100;
    if (savingsRate >= 20) {
      insights.push({
        type: 'success',
        title: 'Great Savings!',
        message: `You're saving ${savingsRate.toFixed(1)}% of your income this month. Keep it up!`,
        value: `${savingsRate.toFixed(1)}%`,
      });
    } else if (savingsRate < 0) {
      insights.push({
        type: 'warning',
        title: 'Spending Alert',
        message: `You're spending more than you earn this month. Consider reducing expenses.`,
        value: `${Math.abs(savingsRate).toFixed(1)}% over budget`,
      });
    } else if (savingsRate < 10) {
      insights.push({
        type: 'info',
        title: 'Low Savings',
        message: `You're only saving ${savingsRate.toFixed(1)}% this month. Try to save at least 20% of your income.`,
        value: `${savingsRate.toFixed(1)}%`,
      });
    }
  }

  // Spending comparison with previous month
  if (previousMonth.expenses > 0) {
    const expenseChange = currentMonth.expenses - previousMonth.expenses;
    const expenseChangePercentage = (expenseChange / previousMonth.expenses) * 100;

    if (Math.abs(expenseChangePercentage) > 10) {
      if (expenseChange > 0) {
        insights.push({
          type: 'warning',
          title: 'Increased Spending',
          message: `You spent ${Math.abs(expenseChangePercentage).toFixed(1)}% more this month compared to last month.`,
          value: `+₹${expenseChange.toFixed(2)}`,
        });
      } else {
        insights.push({
          type: 'success',
          title: 'Reduced Spending',
          message: `You spent ${Math.abs(expenseChangePercentage).toFixed(1)}% less this month. Great job!`,
          value: `-₹${Math.abs(expenseChange).toFixed(2)}`,
        });
      }
    }
  }

  // Category-specific insights
  const topCategory = categorySpending[0];
  if (topCategory && topCategory.percentage > 40) {
    insights.push({
      type: 'info',
      title: 'High Category Spending',
      message: `${topCategory.category} accounts for ${topCategory.percentage.toFixed(1)}% of your expenses. Consider if this aligns with your priorities.`,
      value: `₹${topCategory.amount.toFixed(2)}`,
    });
  }

  // Spending trend insights
  const significantTrends = spendingTrends.filter((t) => Math.abs(t.changePercentage) > 30 && t.currentMonth > 50);
  if (significantTrends.length > 0) {
    const trend = significantTrends[0];
    if (trend.changePercentage > 0) {
      insights.push({
        type: 'warning',
        title: `${trend.category} Spike`,
        message: `Your ${trend.category} spending increased by ${trend.changePercentage.toFixed(1)}% this month.`,
        value: `+₹${trend.change.toFixed(2)}`,
      });
    }
  }

  // Income comparison
  if (previousMonth.income > 0) {
    const incomeChange = currentMonth.income - previousMonth.income;
    const incomeChangePercentage = (incomeChange / previousMonth.income) * 100;

    if (Math.abs(incomeChangePercentage) > 10) {
      if (incomeChange > 0) {
        insights.push({
          type: 'success',
          title: 'Income Increase',
          message: `Your income increased by ${incomeChangePercentage.toFixed(1)}% this month.`,
          value: `+₹${incomeChange.toFixed(2)}`,
        });
      } else {
        insights.push({
          type: 'info',
          title: 'Income Decrease',
          message: `Your income decreased by ${Math.abs(incomeChangePercentage).toFixed(1)}% this month.`,
          value: `-₹${Math.abs(incomeChange).toFixed(2)}`,
        });
      }
    }
  }

  // General budgeting tips
  if (insights.length === 0) {
    insights.push({
      type: 'info',
      title: 'Keep Tracking',
      message: 'Your spending is stable. Continue monitoring your expenses to maintain good financial health.',
    });
  }

  return insights;
}
