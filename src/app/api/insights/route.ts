import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { analyzeTransactions } from '@/lib/budget-insights';
import { parse as parseDate, startOfMonth } from 'date-fns';

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

    // Get month parameter from query string
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month');
    
    let targetMonth = new Date();
    if (monthParam) {
      try {
        targetMonth = parseDate(monthParam, 'yyyy-MM', new Date());
      } catch (error) {
        console.error('Invalid month parameter:', error);
      }
    }

    // Fetch all transactions for the user (last 6 months for better analysis)
    const sixMonthsAgo = new Date(targetMonth);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: sixMonthsAgo,
        },
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    const analysis = analyzeTransactions(transactions, startOfMonth(targetMonth));

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Error analyzing budget:', error);
    return NextResponse.json(
      { error: 'Failed to analyze budget' },
      { status: 500 }
    );
  }
}
