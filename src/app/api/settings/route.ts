import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    const doc = await db.collection('settings').doc('update').get();
    if (doc.exists) {
      return NextResponse.json(doc.data());
    }
    return NextResponse.json({ versionCode: 25, downloadUrl: '' });
  } catch (error) {
    return NextResponse.json({ versionCode: 25, downloadUrl: '' });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    await db.collection('settings').doc('update').set({
      packageName: body.packageName || 'com.jr.streaming',
      versionCode: parseInt(body.versionCode) || 25,
      downloadUrl: body.downloadUrl || '',
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  }
}