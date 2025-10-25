import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfMonth } from 'date-fns';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { amount, categoryId, month } = body;

    if (!amount || !categoryId || !month) {
      return NextResponse.json(
        { error: 'Amount, categoryId, and month are required' },
        { status: 400 }
      );
    }

    const monthDate = startOfMonth(new Date(month));

    console.log('Creating budget:', {
      amount,
      categoryId,
      month,
      monthDate,
      userId: user.id,
    });

    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month: {
          userId: user.id,
          categoryId,
          month: monthDate,
        },
      },
      update: {
        amount: parseFloat(amount),
      },
      create: {
        amount: parseFloat(amount),
        month: monthDate,
        userId: user.id,
        categoryId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, budget }, { status: 201 });
  } catch (error) {
    console.error('Budget creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}

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
    
    let whereClause: any = { userId: user.id };
    
    if (monthParam) {
      const monthDate = startOfMonth(new Date(monthParam));
      whereClause.month = {
        gte: monthDate,
        lt: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1),
      };
    }

    console.log('Fetching budgets with whereClause:', JSON.stringify(whereClause, null, 2));

    const budgets = await prisma.budget.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: { month: 'desc' },
    });

    return NextResponse.json({ budgets });
  } catch (error) {
    console.error('Fetch budgets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const budgetId = searchParams.get('id');

    if (!budgetId) {
      return NextResponse.json(
        { error: 'Budget ID is required' },
        { status: 400 }
      );
    }

    await prisma.budget.delete({
      where: {
        id: budgetId,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Budget deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
}
