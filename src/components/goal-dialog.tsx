'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    icon?: string | null;
    color?: string | null;
}

interface GoalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    goal?: Goal | null; // If provided, edit mode
    onSuccess: () => void;
}

interface GoalFormData {
    name: string;
    targetAmount: string; // use string for input handling
    currentAmount: string;
    icon: string;
}

export function GoalDialog({ open, onOpenChange, goal, onSuccess }: GoalDialogProps) {
    const [isSaving, setIsSaving] = useState(false);
    const { register, handleSubmit, reset, setValue } = useForm<GoalFormData>();

    useEffect(() => {
        if (open) {
            if (goal) {
                setValue('name', goal.name);
                setValue('targetAmount', goal.targetAmount.toString());
                setValue('currentAmount', goal.currentAmount.toString());
                setValue('icon', goal.icon || '🎯');
            } else {
                reset({
                    name: '',
                    targetAmount: '',
                    currentAmount: '0',
                    icon: '🎯',
                });
            }
        }
    }, [open, goal, setValue, reset]);

    const onSubmit = async (data: GoalFormData) => {
        setIsSaving(true);
        try {
            const payload = {
                name: data.name,
                targetAmount: parseFloat(data.targetAmount),
                currentAmount: parseFloat(data.currentAmount),
                icon: data.icon,
            };

            let response;
            if (goal) {
                response = await fetch(`/api/goals/${goal.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            } else {
                response = await fetch('/api/goals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }

            if (!response.ok) {
                throw new Error('Failed to save goal');
            }

            toast.success(goal ? 'Goal updated!' : 'Goal created!');
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error('Error saving goal:', error);
            toast.error('Failed to save goal');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!goal) return;
        if (!confirm('Are you sure you want to delete this goal?')) return;

        setIsSaving(true);
        try {
            const response = await fetch(`/api/goals/${goal.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete goal');

            toast.success('Goal deleted');
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            toast.error('Failed to delete goal');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{goal ? 'Edit Goal' : 'New Savings Goal'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Goal Name</Label>
                        <Input id="name" placeholder="e.g. New iPhone, Vacation" {...register('name', { required: true })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="targetAmount">Target Amount</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                <Input id="targetAmount" type="number" className="pl-6" placeholder="50000" {...register('targetAmount', { required: true })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currentAmount">Current Savings</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                <Input id="currentAmount" type="number" className="pl-6" placeholder="0" {...register('currentAmount')} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="icon">Icon (Emoji)</Label>
                        <Input id="icon" placeholder="🎯" {...register('icon')} />
                    </div>

                    <DialogFooter className="flex justify-between sm:justify-between w-full mt-6">
                        {goal && (
                            <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={isSaving}>
                                Delete
                            </Button>
                        )}
                        <div className="flex gap-2 ml-auto">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Goal'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
