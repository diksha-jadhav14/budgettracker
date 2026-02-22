'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, CheckCircle, Target, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface BudgetStatus {
  budgetId: string;
  category: {
    id: string;
    name: string;
    icon?: string | null;
  };
  budgetAmount: number;
  spent: number;
  remaining: number;
  percentage: number;
  alertLevel: 'safe' | 'warning' | 'danger' | 'exceeded';
  message?: string;
}

interface BudgetCardProps {
  budgetStatus: BudgetStatus[];
  onSetBudget: () => void;
}

export function BudgetCard({ budgetStatus, onSetBudget }: BudgetCardProps) {
  const getAlertConfig = (alertLevel: string) => {
    switch (alertLevel) {
      case 'safe':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-500',
          borderColor: 'border-green-200',
          badgeVariant: 'outline' as const,
          badgeColor: 'text-green-700 border-green-200 bg-green-50',
          label: 'On Track',
          emoji: '😊',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-orange-500',
          bgColor: 'bg-orange-500',
          borderColor: 'border-orange-200',
          badgeVariant: 'outline' as const,
          badgeColor: 'text-orange-700 border-orange-200 bg-orange-50',
          label: 'Warning',
          emoji: '😐',
        };
      case 'danger':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500',
          borderColor: 'border-red-200',
          badgeVariant: 'destructive' as const,
          badgeColor: '',
          label: 'Near Limit',
          emoji: '⚠️',
        };
      case 'exceeded':
        return {
          icon: XCircle,
          color: 'text-red-700',
          bgColor: 'bg-red-700',
          borderColor: 'border-red-200',
          badgeVariant: 'destructive' as const,
          badgeColor: 'animate-pulse',
          label: 'Over Budget',
          emoji: '🔥',
        };
      default:
        return {
          icon: Target,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500',
          borderColor: 'border-blue-200',
          badgeVariant: 'secondary' as const,
          badgeColor: '',
          label: 'Unknown',
          emoji: '🤔',
        };
    }
  };

  if (budgetStatus.length === 0) {
    return (
      <Card className="border-border/50 shadow-md h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Budget Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 flex flex-col items-center justify-center h-full">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"
            >
              <Target className="h-8 w-8 text-primary" />
            </motion.div>
            <p className="text-muted-foreground mb-4">No budgets set yet</p>
            <Button onClick={onSetBudget} variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors">
              Set Your First Budget
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-md h-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Budget Goals
        </CardTitle>
        <Button onClick={onSetBudget} variant="ghost" size="sm" className="h-8">
          Manage
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {budgetStatus.map((budget, index) => {
          const config = getAlertConfig(budget.alertLevel);
          const Icon = config.icon;
          const isExceeded = budget.alertLevel === 'exceeded';
          const percentage = Math.min(budget.percentage, 100);

          return (
            <motion.div
              key={budget.budgetId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`group p-4 rounded-xl border ${config.borderColor} bg-card hover:shadow-md transition-all duration-300 ${isExceeded ? 'bg-red-50/10' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${config.bgColor}/10 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      {budget.category.icon} {budget.category.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-medium text-foreground">₹{budget.spent.toFixed(0)}</span> of ₹{budget.budgetAmount.toFixed(0)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={config.badgeVariant} className={`${config.badgeColor} px-2 py-0.5 h-6`}>
                    {config.label}
                  </Badge>
                  <span className="text-xl" role="img" aria-label={config.label}>
                    {config.emoji}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">
                    {budget.percentage}% used
                  </span>
                  <span className={budget.remaining < 0 ? 'text-red-600 font-bold' : 'text-muted-foreground'}>
                    {budget.remaining < 0 ? 'Over: ' : 'Left: '}
                    <span className={budget.remaining < 0 ? 'text-red-600' : 'text-green-600 font-medium'}>
                      ₹{Math.abs(budget.remaining).toFixed(0)}
                    </span>
                  </span>
                </div>
                <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary/50">
                  <motion.div
                    className={`h-full ${config.bgColor} shadow-sm rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Display the motivational/warning message if available */}
              {budget.message && (
                <div className={`mt-2 text-xs p-2 rounded-md border ${config.borderColor} bg-background/50 flex items-start gap-2`}>
                  <Icon className={`h-3 w-3 ${config.color} mt-0.5 flex-shrink-0`} />
                  <span className="text-muted-foreground">{budget.message}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
