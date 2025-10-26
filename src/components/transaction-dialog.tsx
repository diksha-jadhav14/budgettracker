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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import {
  UploadIcon,
  CheckCircleIcon,
  ImageIcon,
} from 'lucide-react';

type TransactionType = 'INCOME' | 'EXPENSE';

interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string | null;
  color?: string | null;
}

interface TransactionFormData {
  amount: string;
  description: string;
  type: TransactionType;
  date: string;
  categoryId?: string;
}

interface OCRResult {
  rawText: string;
  parsed: {
    amount: number | null;
    type: TransactionType | null;
    description: string | null;
    confidence: 'high' | 'medium' | 'low';
  };
}

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TransactionDialog({
  open,
  onOpenChange,
  onSuccess,
}: TransactionDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } =
    useForm<TransactionFormData>({
      defaultValues: {
        amount: '',
        description: '',
        type: 'EXPENSE',
        date: new Date().toISOString().split('T')[0],
        categoryId: undefined,
      },
    });

  const watchedType = watch('type');
  const watchedCategoryId = watch('categoryId');

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        if (data.categories.length === 0) {
          await seedDefaultCategories();
          const retryResponse = await fetch('/api/categories');
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            setCategories(retryData.categories);
          }
        } else {
          setCategories(data.categories);
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const seedDefaultCategories = async () => {
    try {
      await fetch('/api/categories/seed', { method: 'POST' });
    } catch (error) {
      console.error('Failed to seed categories:', error);
    }
  };

  const filteredCategories = categories.filter(
    (cat) => cat.type === watchedType
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImageWithOCR = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/upload/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const result: { success: boolean } & OCRResult = await response.json();
      setOcrResult(result);

      if (result.parsed.amount) {
        setValue('amount', result.parsed.amount.toString());
      }
      if (result.parsed.type) {
        setValue('type', result.parsed.type);
      }
      if (result.parsed.description) {
        setValue('description', result.parsed.description);
      }

      toast.success('Image processed! Please review the extracted data.');
    } catch (error) {
      console.error('OCR processing error:', error);
      toast.error('Failed to process image. Please try manual entry.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(data.amount),
          description: data.description,
          type: data.type,
          date: data.date,
          categoryId: data.categoryId || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save transaction');
      }

      toast.success('Transaction saved successfully!');
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Save transaction error:', error);
      toast.error('Failed to save transaction');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedFile(null);
    setImagePreview(null);
    setOcrResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Upload a receipt or enter transaction details manually
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Receipt</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4 mt-4">
            {!imagePreview ? (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Click to upload receipt</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Receipt preview"
                    className="w-full h-auto max-h-[300px] object-contain"
                  />
                </div>

                {ocrResult && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Extracted Data
                      </Label>
                      <Badge
                        variant={
                          ocrResult.parsed.confidence === 'high'
                            ? 'default'
                            : ocrResult.parsed.confidence === 'medium'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {ocrResult.parsed.confidence} confidence
                      </Badge>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono">
                      <p className="text-muted-foreground line-clamp-3">
                        {ocrResult.rawText}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      setImagePreview(null);
                      setOcrResult(null);
                    }}
                    className="flex-1"
                  >
                    Change Image
                  </Button>
                  {!ocrResult && (
                    <Button
                      type="button"
                      onClick={processImageWithOCR}
                      disabled={isProcessing}
                      className="flex-1 gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Spinner className="h-4 w-4" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <UploadIcon className="h-4 w-4" />
                          Process with OCR
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {ocrResult && (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Transaction Type</Label>
                      <Select
                        value={watchedType}
                        onValueChange={(value) => {
                          setValue('type', value as TransactionType);
                          setValue('categoryId', undefined);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EXPENSE">Expense</SelectItem>
                          <SelectItem value="INCOME">Income</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category (Optional)</Label>
                      <Select
                        value={watchedCategoryId || undefined}
                        onValueChange={(value) => setValue('categoryId', value)}
                        disabled={isLoadingCategories}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.icon && `${category.icon} `}{category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          ₹
                        </span>
                        <Input
                          {...register('amount', { required: true })}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-7"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        {...register('description')}
                        placeholder="Enter description..."
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input {...register('date')} type="date" />
                    </div>

                    <Button
                      type="submit"
                      className="w-full gap-2"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Spinner className="h-4 w-4" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-4 w-4" />
                          Save Transaction
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Transaction Type</Label>
                <Select
                  value={watchedType}
                  onValueChange={(value) => {
                    setValue('type', value as TransactionType);
                    setValue('categoryId', undefined);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                    <SelectItem value="INCOME">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Select
                  value={watchedCategoryId || undefined}
                  onValueChange={(value) => setValue('categoryId', value)}
                  disabled={isLoadingCategories}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon && `${category.icon} `}{category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    {...register('amount', { required: true })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  {...register('description')}
                  placeholder="Enter description..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input {...register('date')} type="date" />
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    Save Transaction
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
