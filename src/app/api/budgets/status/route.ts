import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month');
    const monthDate = monthParam ? new Date(monthParam) : new Date();

    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    console.log('Fetching budgets for:', {
      userId: user.id,
      monthStart,
      monthEnd,
      monthParam,
    });

    const budgets = await prisma.budget.findMany({
      where: {
        userId: user.id,
        month: {
          gte: monthStart,
          lt: new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1),
        },
      },
      include: {
        category: true,
      },
    });

    console.log('Found budgets:', budgets.length);

    const budgetStatus = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await prisma.transaction.aggregate({
          where: {
            userId: user.id,
            categoryId: budget.categoryId,
            type: 'EXPENSE',
            date: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const spentAmount = spent._sum.amount || 0;
        const percentage = (spentAmount / budget.amount) * 100;

        let alertLevel: 'safe' | 'warning' | 'danger' | 'exceeded' = 'safe';
        let message = '';

        if (percentage >= 120) {
          alertLevel = 'exceeded';
          message = "You are overspending. This can affect your savings goals. Take a break.";
        } else if (percentage >= 100) {
          alertLevel = 'exceeded';
          message = `You’ve crossed your ₹${budget.amount} limit. Consider reducing expenses.`;
        } else if (percentage >= 90) {
          alertLevel = 'danger';
          message = "Careful! You’re close to your limit.";
        } else if (percentage >= 70) {
          alertLevel = 'warning';
          message = "You’ve used 70% of your budget. Slow down a little.";
        } else {
          alertLevel = 'safe';
          message = "You are doing great! Keep it up.";
        }

        return {
          budgetId: budget.id,
          category: budget.category,
          budgetAmount: budget.amount,
          spent: spentAmount,
          remaining: budget.amount - spentAmount,
          percentage: Math.round(percentage),
          alertLevel,
          message,
        };
      })
    );

    return NextResponse.json({ budgetStatus });
  } catch (error) {
    console.error('Budget status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budget status' },
      { status: 500 }
    );
  }
}
