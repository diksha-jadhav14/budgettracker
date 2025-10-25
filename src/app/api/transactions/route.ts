import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const { amount, description, type, date, categoryId, imageUrl } = body;

    if (!amount || !type) {
      return NextResponse.json(
        { error: 'Amount and type are required' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        description: description || null,
        type,
        date: date ? new Date(date) : new Date(),
        categoryId: categoryId || null,
        userId: user.id,
        imageUrl: imageUrl || null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, transaction }, { status: 201 });
  } catch (error) {
    console.error('Transaction creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

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

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      include: { category: true },
      orderBy: { date: 'desc' },
      take: 50,
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
