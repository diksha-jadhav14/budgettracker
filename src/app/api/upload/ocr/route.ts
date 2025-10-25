import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { extractTextFromImage, parseTransactionText } from '@/lib/ocr';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    console.log('Starting OCR processing...');
    const text = await extractTextFromImage(buffer);
    console.log('OCR completed. Extracted text length:', text.length);

    const parsedData = parseTransactionText(text);

    return NextResponse.json({
      success: true,
      rawText: text,
      parsed: parsedData,
    });
  } catch (error) {
    console.error('OCR processing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


