import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateGoalSchema = z.object({
    name: z.string().min(1).optional(),
    targetAmount: z.number().min(1).optional(),
    currentAmount: z.number().min(0).optional(),
    deadline: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
    icon: z.string().optional().nullable(),
});

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = updateGoalSchema.parse(body);

        const goal = await prisma.goal.findUnique({
            where: { id: params.id },
        });

        if (!goal || goal.userId !== session.user.id) {
            return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
        }

        const updatedGoal = await prisma.goal.update({
            where: { id: params.id },
            data: {
                ...validatedData,
                deadline: validatedData.deadline ? new Date(validatedData.deadline) : undefined,
            },
        });

        return NextResponse.json({ goal: updatedGoal });
    } catch (error) {
        console.error('Failed to update goal:', error);
        return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const goal = await prisma.goal.findUnique({
            where: { id: params.id },
        });

        if (!goal || goal.userId !== session.user.id) {
            return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
        }

        await prisma.goal.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete goal:', error);
        return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
    }
}
