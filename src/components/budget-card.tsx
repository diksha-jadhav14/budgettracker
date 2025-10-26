'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircleIcon, AlertTriangleIcon, CheckCircleIcon, TargetIcon, XCircleIcon } from 'lucide-react';

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
          icon: CheckCircleIcon,
          color: 'text-green-600',
          bgColor: 'bg-green-500',
          badgeVariant: 'default' as const,
          label: 'On Track',
        };
      case 'warning':
        return {
          icon: AlertTriangleIcon,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-500',
          badgeVariant: 'secondary' as const,
          label: 'Warning',
        };
      case 'danger':
        return {
          icon: AlertCircleIcon,
          color: 'text-orange-600',
          bgColor: 'bg-orange-500',
          badgeVariant: 'destructive' as const,
          label: 'At Limit',
        };
      case 'exceeded':
        return {
          icon: XCircleIcon,
          color: 'text-red-600',
          bgColor: 'bg-red-500',
          badgeVariant: 'destructive' as const,
          label: 'Exceeded',
        };
      default:
        return {
          icon: TargetIcon,
          color: 'text-gray-600',
          bgColor: 'bg-gray-500',
          badgeVariant: 'secondary' as const,
          label: 'Unknown',
        };
    }
  };

  if (budgetStatus.length === 0) {
    return (
      <Card className="border-border/50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TargetIcon className="h-5 w-5 text-primary" />
            Budget Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <TargetIcon className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground mb-4">No budgets set yet</p>
            <Button onClick={onSetBudget} variant="outline">
              Set Your First Budget
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <TargetIcon className="h-5 w-5 text-primary" />
          Budget Goals
        </CardTitle>
        <Button onClick={onSetBudget} variant="ghost" size="sm">
          Add Budget
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgetStatus.map((budget) => {
            const config = getAlertConfig(budget.alertLevel);
            const Icon = config.icon;

            return (
              <div
                key={budget.budgetId}
                className="p-4 rounded-lg border border-border/40 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${config.bgColor}/10`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {budget.category.icon && `${budget.category.icon} `}
                        {budget.category.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ₹{budget.spent.toFixed(2)} of ₹{budget.budgetAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={config.badgeVariant} className="text-xs">
                    {config.label}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {budget.percentage}% used
                    </span>
                    <span className={budget.remaining < 0 ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                      {budget.remaining < 0 ? 'Over by' : 'Remaining'}: ₹{Math.abs(budget.remaining).toFixed(2)}
                    </span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div 
                      className={`h-full transition-all ${config.bgColor}`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
