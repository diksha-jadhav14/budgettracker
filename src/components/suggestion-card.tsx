'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LightbulbIcon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface SuggestionCardProps {
    savings: number;
    totalIncome: number;
    totalExpenses: number;
    categorySpending: { name: string; value: number }[];
}

export function SuggestionCard({ savings, totalIncome, totalExpenses, categorySpending }: SuggestionCardProps) {
    const getSuggestions = () => {
        const suggestions = [];

        // 1. Savings Encouragement
        if (savings > 500) {
            suggestions.push({
                type: 'positive',
                text: `Awesome! You've saved ₹${savings.toFixed(0)} so far. That's enough for a nice dinner date! 🍽️`,
            });
        } else if (savings > 0) {
            suggestions.push({
                type: 'neutral',
                text: `You're in the green by ₹${savings.toFixed(0)}. Keep saving to reach your goals! 🌱`,
            });
        } else if (savings < 0) {
            suggestions.push({
                type: 'negative',
                text: `You're over budget by ₹${Math.abs(savings).toFixed(0)}. Try cutting back on non-essentials this week.`,
            });
        }

        // 2. Category Specific Advice
        const foodSpending = categorySpending.find(c => c.name.toLowerCase().includes('food'))?.value || 0;
        if (foodSpending > 2000) {
            suggestions.push({
                type: 'warning',
                text: "Spending more than ₹2000 on food? Cooking at home is healthier and cheaper! 🥗",
            });
        }

        const shoppingSpending = categorySpending.find(c => c.name.toLowerCase().includes('shopping'))?.value || 0;
        if (shoppingSpending > 1500) {
            suggestions.push({
                type: 'warning',
                text: "High shopping expenses detected. Ask yourself: 'Do I really need this?' before buying. 🛍️",
            });
        }

        // 3. General Income Ratio
        if (totalIncome > 0 && totalExpenses / totalIncome < 0.5) {
            suggestions.push({
                type: 'positive',
                text: "You've spent less than 50% of your income. Financial freedom is calling! 🚀",
            });
        }

        // Fallback
        if (suggestions.length === 0) {
            suggestions.push({
                type: 'neutral',
                text: "Track every expense to get smarter insights. You're doing great! ✨",
            });
        }

        return suggestions.slice(0, 3); // Return top 3 suggestions
    };

    const suggestions = getSuggestions();

    return (
        <Card className="border-border/50 shadow-md bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-primary">
                    <Sparkles className="h-5 w-5 fill-primary text-primary" />
                    Smart Insights
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-3 rounded-lg border text-sm flex gap-3 items-start ${suggestion.type === 'positive'
                                    ? 'bg-green-500/10 border-green-200 text-green-800 dark:text-green-300'
                                    : suggestion.type === 'warning'
                                        ? 'bg-orange-500/10 border-orange-200 text-orange-800 dark:text-orange-300'
                                        : suggestion.type === 'negative'
                                            ? 'bg-red-500/10 border-red-200 text-red-800 dark:text-red-300'
                                            : 'bg-blue-500/10 border-blue-200 text-blue-800 dark:text-blue-300'
                                }`}
                        >
                            <LightbulbIcon className="h-4 w-4 mt-0.5 flex-shrink-0 opacity-70" />
                            <span>{suggestion.text}</span>
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
