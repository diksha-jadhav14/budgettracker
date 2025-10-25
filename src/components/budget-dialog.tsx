'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { CheckCircleIcon, TargetIcon } from 'lucide-react';
import { startOfMonth, format } from 'date-fns';

interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string | null;
  color?: string | null;
}

interface BudgetFormData {
  amount: string;
  categoryId: string;
  month: string;
}

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  selectedMonth?: Date;
}

export function BudgetDialog({
  open,
  onOpenChange,
  onSuccess,
  selectedMonth = new Date(),
}: BudgetDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } =
    useForm<BudgetFormData>({
      defaultValues: {
        amount: '',
        categoryId: '',
        month: format(startOfMonth(selectedMonth), 'yyyy-MM-dd'),
      },
    });

  const watchedCategoryId = watch('categoryId');

  useEffect(() => {
    if (open) {
      fetchCategories();
      setValue('month', format(startOfMonth(selectedMonth), 'yyyy-MM-dd'));
    }
  }, [open, selectedMonth, setValue]);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        const expenseCategories = data.categories.filter(
          (cat: Category) => cat.type === 'EXPENSE'
        );
        setCategories(expenseCategories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const onSubmit = async (data: BudgetFormData) => {
    setIsSaving(true);
    try {
      const monthDate = new Date(data.month + 'T00:00:00');
      const monthStart = startOfMonth(monthDate);
      
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(data.amount),
          categoryId: data.categoryId,
          month: monthStart.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save budget');
      }

      toast.success('Budget saved successfully!');
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Save budget error:', error);
      toast.error('Failed to save budget');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TargetIcon className="h-5 w-5 text-primary" />
            Set Budget Goal
          </DialogTitle>
          <DialogDescription>
            Set a spending limit for a category
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={watchedCategoryId}
              onValueChange={(value) => setValue('categoryId', value)}
              disabled={isLoadingCategories}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon && `${category.icon} `}
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                {...register('amount', { required: true, min: 0 })}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Input {...register('month')} type="date" disabled />
            <p className="text-xs text-muted-foreground">
              Budget will be set for the selected month
            </p>
          </div>

          <Button
            type="submit"
            className="w-full gap-2"
            disabled={isSaving || !watchedCategoryId}
          >
            {isSaving ? (
              <>
                <Spinner className="h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4" />
                Set Budget
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
