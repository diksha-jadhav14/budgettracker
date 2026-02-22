import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const goalSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    targetAmount: z.number().min(1, 'Target amount must be positive'),
    currentAmount: z.number().min(0, 'Current amount cannot be negative').default(0),
    deadline: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
    icon: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const goals = await prisma.goal.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return NextResponse.json({ goals });
    } catch (error) {
        console.error('Failed to fetch goals:', error);
        return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = goalSchema.parse(body);

        const goal = await prisma.goal.create({
            data: {
                ...validatedData,
                deadline: validatedData.deadline ? new Date(validatedData.deadline) : null,
                userId: session.user.id,
            },
        });

        return NextResponse.json({ goal });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const zodError = error as z.ZodError;
            return NextResponse.json({ error: zodError.errors[0].message }, { status: 400 });
        }
        console.error('Failed to create goal:', error);
        return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
    }
}
