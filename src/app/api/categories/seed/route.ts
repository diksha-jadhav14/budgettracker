import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DEFAULT_CATEGORIES } from '@/lib/default-categories';

export async function POST() {
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

    // Check if user already has categories
    const existingCategories = await prisma.category.findMany({
      where: { userId: user.id },
    });

    if (existingCategories.length > 0) {
      return NextResponse.json(
        { message: 'Categories already exist', count: existingCategories.length },
        { status: 200 }
      );
    }

    // Create default categories
    const categories = await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((cat) => ({
        ...cat,
        userId: user.id,
      })),
    });

    return NextResponse.json({
      success: true,
      message: 'Default categories created',
      count: categories.count,
    });
  } catch (error) {
    console.error('Seed categories error:', error);
    return NextResponse.json(
      { error: 'Failed to seed categories' },
      { status: 500 }
    );
  }
}
