'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PlusIcon, PencilIcon, TrashIcon, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';

interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    icon?: string | null;
    color?: string | null;
}

interface GoalCardProps {
    goal: Goal;
    onEdit: (goal: Goal) => void;
    onAddMoney: (goal: Goal) => void;
}

export function GoalCard({ goal, onEdit, onAddMoney }: GoalCardProps) {
    const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    const isCompleted = goal.currentAmount >= goal.targetAmount;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full"
        >
            <Card className={`h-full border-border/50 shadow-sm hover:shadow-md transition-all ${isCompleted ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200' : ''}`}>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                                {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <span className="text-xl">{goal.icon || '🎯'}</span>}
                            </div>
                            <div>
                                <CardTitle className="text-base font-semibold">{goal.name}</CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    {isCompleted ? 'Goal Reached!' : `Target: ₹${goal.targetAmount.toLocaleString()}`}
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => onEdit(goal)}>
                            <PencilIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">₹{goal.currentAmount.toLocaleString()}</span>
                            <span className="text-muted-foreground">{Math.round(percentage)}%</span>
                        </div>
                        <Progress value={percentage} className={`h-2 ${isCompleted ? 'bg-green-100' : ''}`} indicatorClassName={isCompleted ? 'bg-green-500' : ''} />

                        {!isCompleted && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-4 gap-2 hover:bg-primary/5 hover:text-primary transition-colors"
                                onClick={() => onAddMoney(goal)}
                            >
                                <PlusIcon className="h-3 w-3" /> Add Money
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
