'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { GoalCard } from '@/components/goal-card';
import { GoalDialog } from '@/components/goal-dialog';
import { motion } from 'framer-motion';

interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    icon?: string | null;
    color?: string | null;
}

export function GoalsSection() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

    const fetchGoals = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/goals');
            if (response.ok) {
                const data = await response.json();
                setGoals(data.goals);
            }
        } catch (error) {
            console.error('Failed to fetch goals:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleEdit = (goal: Goal) => {
        setEditingGoal(goal);
        setIsDialogOpen(true);
    };

    const handleAddMoney = (goal: Goal) => {
        // For simplicity, just open edit dialog for now
        // Ideally, a separate quick-add dialog
        handleEdit(goal);
    };

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) setEditingGoal(null);
    };

    return (
        <Card className="border-border/50 shadow-md h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle>My Saving Goals</CardTitle>
                    <CardDescription>
                        {goals.length} active goals
                    </CardDescription>
                </div>
                <Button size="sm" onClick={() => setIsDialogOpen(true)} className="bg-primary/10 text-primary hover:bg-primary/20 shadow-none border border-primary/20">
                    <PlusIcon className="h-4 w-4 mr-1" /> New Goal
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center p-8">Loading...</div>
                ) : goals.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                        <p className="mb-2">No goals set yet.</p>
                        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                            Create your first goal
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        {goals.map((goal) => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                onEdit={() => handleEdit(goal)}
                                onAddMoney={() => handleAddMoney(goal)}
                            />
                        ))}
                    </div>
                )}
            </CardContent>

            <GoalDialog
                open={isDialogOpen}
                onOpenChange={handleDialogClose}
                goal={editingGoal}
                onSuccess={fetchGoals}
            />
        </Card>
    );
}
