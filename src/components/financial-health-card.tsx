'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Sparkles, Award } from 'lucide-react';

interface FinancialHealthCardProps {
    score: number;
}

export function FinancialHealthCard({ score }: FinancialHealthCardProps) {
    const getStatus = (score: number) => {
        if (score >= 80) return { label: 'Excellent', color: 'text-green-500', bg: 'bg-green-500' };
        if (score >= 60) return { label: 'Good', color: 'text-blue-500', bg: 'bg-blue-500' };
        if (score >= 40) return { label: 'Needs Improvement', color: 'text-yellow-500', bg: 'bg-yellow-500' };
        return { label: 'Risk Zone', color: 'text-red-500', bg: 'bg-red-500' };
    };

    const status = getStatus(score);
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <Card className="border-border/50 shadow-md h-full overflow-hidden relative">
            <div className={`absolute top-0 left-0 w-1 h-full ${status.bg} opacity-20`} />
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Award className={`h-5 w-5 ${status.color}`} />
                    Financial Health Score
                </CardTitle>
                <CardDescription>Based on your spending habits</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="transform -rotate-90 w-full h-full">
                        <circle
                            className="text-muted/20"
                            strokeWidth="10"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="80"
                            cy="80"
                        />
                        <motion.circle
                            className={`${status.color}`}
                            strokeWidth="10"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="80"
                            cy="80"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold ${status.color}`}>{Math.round(score)}</span>
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">/ 100</span>
                    </div>
                </div>

                <div className={`mt-4 px-3 py-1 rounded-full text-sm font-semibold border ${status.color.replace('text-', 'border-').replace('500', '200')} ${status.color.replace('text-', 'bg-').replace('500', '50')}`}>
                    {status.label}
                </div>
            </CardContent>
        </Card>
    );
}
