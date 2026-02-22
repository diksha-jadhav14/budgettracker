import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, getDaysInMonth, getDate } from 'date-fns';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const monthParam = searchParams.get('month');
        const monthDate = monthParam ? new Date(monthParam) : new Date();

        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        const userId = session.user.id;

        // 1. Fetch Data
        const transactions = await prisma.transaction.findMany({
            where: {
                userId,
                date: { gte: monthStart, lte: monthEnd },
                type: 'EXPENSE',
            },
            include: { category: true },
        });

        const incomeTransactions = await prisma.transaction.findMany({
            where: {
                userId,
                date: { gte: monthStart, lte: monthEnd },
                type: 'INCOME',
            },
        });

        const budgets = await prisma.budget.findMany({
            where: {
                userId,
                month: { gte: monthStart, lt: new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1) },
            },
        });

        // @ts-ignore
        const goals = await prisma.goal.findMany({
            where: { userId },
        });

        // 2. Calculate Totals
        const totalExpenses = transactions.reduce((acc, t) => acc + t.amount, 0);
        const totalIncome = incomeTransactions.reduce((acc, t) => acc + t.amount, 0);
        const totalBudget = budgets.reduce((acc, b) => acc + b.amount, 0);
        const savings = totalIncome - totalExpenses;

        // 3. Financial Health Score Logic
        let score = 0;

        // A. Budget Discipline (40%)
        const budgetUsedPercentage = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;
        if (budgetUsedPercentage < 80) score += 40;
        else if (budgetUsedPercentage <= 100) score += 25;
        else score += 10;

        // B. Savings Contribution (25%)
        if (savings > 0) score += 25;
        else score += 5;

        // C. Impulse Control (15%) - Using strict budget adherence
        // Check if any specific budget category is exceeded
        let hasExceededBudget = false;
        for (const budget of budgets) {
            const categorySpend = transactions
                .filter(t => t.categoryId === budget.categoryId)
                .reduce((sum, t) => sum + t.amount, 0);
            if (categorySpend > budget.amount) {
                hasExceededBudget = true;
                break;
            }
        }
        if (!hasExceededBudget) score += 15;
        else score += 5;

        // D. Goal Progress (20%)
        const activeGoals = goals.filter((g: any) => g.currentAmount > 0);
        if (activeGoals.length > 0) score += 20; // Has started saving for at least one goal
        else if (goals.length > 0) score += 10; // Has goals but not started
        else score += 5; // No goals

        // 4. Future Projection Logic
        const currentDay = getDate(new Date()); // Current day of month (1-31)
        const totalDays = getDaysInMonth(monthDate);
        const daysRemaining = totalDays - currentDay;

        // If viewing a past month or future logic is simple
        // For current month: Projection = (Current / Day) * TotalDays
        // Avoid division by zero on day 0/1
        const projection = currentDay > 0
            ? (totalExpenses / Math.max(currentDay, 1)) * totalDays
            : totalExpenses;

        const dailyAverage = currentDay > 0 ? totalExpenses / currentDay : 0;

        const projectedStatus = projection > totalBudget ? 'danger' : 'safe';
        const amountOver = Math.max(0, projection - totalBudget);

        // Coaching Message
        let coachingMessage = '';
        if (projection > totalBudget) {
            const recommendedDaily = Math.max(0, (totalBudget - totalExpenses) / Math.max(1, daysRemaining));
            coachingMessage = `To stay safely within your ₹${totalBudget} budget, try to limit spending to ₹${recommendedDaily.toFixed(0)}/day for the rest of the month.`;
        } else {
            coachingMessage = `Great job! You are on track to spend around ₹${projection.toFixed(0)}, which is well within your budget.`;
        }

        return NextResponse.json({
            score: Math.min(100, score),
            breakdown: {
                budgetDiscipline: budgetUsedPercentage < 80 ? 'Excellent' : budgetUsedPercentage <= 100 ? 'Good' : 'Needs Work',
                savings: savings > 0 ? 'Positive' : 'Negative',
                impulseControl: !hasExceededBudget ? 'Good' : 'Needs Work',
                goals: activeGoals.length > 0 ? 'Active' : 'Inactive',
            },
            projection: {
                amount: Math.round(projection),
                status: projectedStatus,
                message: coachingMessage,
                dailyAverage: Math.round(dailyAverage),
                daysRemaining,
            }
        });

    } catch (error) {
        console.error('Financial health calculation error:', error);
        return NextResponse.json({ error: 'Failed to calculate financial health' }, { status: 500 });
    }
}
