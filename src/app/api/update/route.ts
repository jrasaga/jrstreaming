import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  const packageName = request.nextUrl.searchParams.get('packageName');

  if (!packageName) {
    return NextResponse.json({ error: 'Package name não informado' }, { status: 400 });
  }

  try {
    const doc = await db.collection('settings').doc('update').get();
    
    if (doc.exists) {
      const data = doc.data();
      return NextResponse.json({
        packageName: data?.packageName || 'com.jr.streaming',
        versionCode: data?.versionCode || 25,
        url: data?.downloadUrl || ''
      });
    }
  } catch (error) {}

  // Fallback
  return NextResponse.json({
    packageName: 'com.jr.streaming',
    versionCode: 25,
    url: ''
  });
}