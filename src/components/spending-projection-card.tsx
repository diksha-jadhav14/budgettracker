'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SpendingProjectionProps {
    currentSpend: number;
    projectedSpend: number;
    totalBudget: number;
    daysRemaining: number;
    dailyAverage: number;
}

export function SpendingProjectionCard({
    currentSpend,
    projectedSpend,
    totalBudget,
    daysRemaining,
    dailyAverage
}: SpendingProjectionProps) {
    const isOverBudget = projectedSpend > totalBudget;
    const percentage = Math.min((projectedSpend / totalBudget) * 100, 100);

    // Calculate recommended daily spend to stay on budget
    const budgetRemaining = totalBudget - currentSpend;
    const recommendedDaily = Math.max(0, budgetRemaining / Math.max(1, daysRemaining));

    return (
        <Card className="border-border/50 shadow-md h-full bg-gradient-to-br from-background to-muted/30">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Spending Projection
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">This Month's Forecast</p>
                        <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
                            ₹{projectedSpend.toLocaleString()}
                        </p>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-sm text-muted-foreground">Budget Limit</p>
                        <div className="flex items-center justify-end gap-1">
                            <p className="font-semibold text-foreground">₹{totalBudget.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Projected vs Budget</span>
                        <span>{Math.round(percentage)}%</span>
                    </div>
                    <Progress
                        value={percentage}
                        className="h-2"
                        indicatorClassName={isOverBudget ? 'bg-red-500' : 'bg-green-500'}
                    />
                </div>

                {isOverBudget ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-200 rounded-lg p-3 text-sm text-red-700 dark:text-red-300 flex items-start gap-3"
                    >
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold mb-1">Risk of Overspending</p>
                            <p className="text-xs opacity-90">
                                You're projected to exceed your budget by <span className="font-bold">₹{(projectedSpend - totalBudget).toLocaleString()}</span>.
                                Try limiting your daily spend to <span className="font-bold">₹{recommendedDaily.toFixed(0)}</span> to stay on track.
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-500/10 border border-green-200 rounded-lg p-3 text-sm text-green-700 dark:text-green-300 flex items-start gap-3"
                    >
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold mb-1">You're On Track!</p>
                            <p className="text-xs opacity-90">
                                Great job! At your current pace (₹{dailyAverage.toFixed(0)}/day), you'll likely finish the month well under budget.
                            </p>
                        </div>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    );
}
