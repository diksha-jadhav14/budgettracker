import { TransactionType } from '@prisma/client';

export const DEFAULT_CATEGORIES = [
  // Expense categories
  { name: 'Food & Dining', type: 'EXPENSE' as TransactionType, icon: '🍔', color: '#FF6B6B' },
  { name: 'Transportation', type: 'EXPENSE' as TransactionType, icon: '🚗', color: '#4ECDC4' },
  { name: 'Shopping', type: 'EXPENSE' as TransactionType, icon: '🛍️', color: '#95E1D3' },
  { name: 'Entertainment', type: 'EXPENSE' as TransactionType, icon: '🎮', color: '#F38181' },
  { name: 'Bills & Utilities', type: 'EXPENSE' as TransactionType, icon: '💡', color: '#AA96DA' },
  { name: 'Healthcare', type: 'EXPENSE' as TransactionType, icon: '⚕️', color: '#FCBAD3' },
  { name: 'Education', type: 'EXPENSE' as TransactionType, icon: '📚', color: '#FFD93D' },
  { name: 'Housing', type: 'EXPENSE' as TransactionType, icon: '🏠', color: '#6BCB77' },
  { name: 'Personal Care', type: 'EXPENSE' as TransactionType, icon: '💅', color: '#FF8CC6' },
  { name: 'Travel', type: 'EXPENSE' as TransactionType, icon: '✈️', color: '#89CFF0' },
  { name: 'Other Expenses', type: 'EXPENSE' as TransactionType, icon: '📦', color: '#B0B0B0' },
  
  // Income categories
  { name: 'Salary', type: 'INCOME' as TransactionType, icon: '💰', color: '#4CAF50' },
  { name: 'Freelance', type: 'INCOME' as TransactionType, icon: '💼', color: '#2196F3' },
  { name: 'Investment', type: 'INCOME' as TransactionType, icon: '📈', color: '#9C27B0' },
  { name: 'Gift', type: 'INCOME' as TransactionType, icon: '🎁', color: '#FF9800' },
  { name: 'Other Income', type: 'INCOME' as TransactionType, icon: '💵', color: '#607D8B' },
];
