import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export async function GET() {
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

    // Get last 6 months of data
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: user.id,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      const income = transactions
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expenses = transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      months.push({
        month: format(date, 'MMM yyyy'),
        income,
        expenses,
        balance: income - expenses,
      });
    }

    return NextResponse.json({ trends: months });
  } catch (error) {
    console.error('Fetch trends error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends' },
      { status: 500 }
    );
  }
}
