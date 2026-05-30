import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get('deviceId');
    const status = request.nextUrl.searchParams.get('status');

    if (!deviceId || !status) {
      return NextResponse.json({ error: 'deviceId e status obrigatórios' }, { status: 400 });
    }

    const snapshot = await db
      .collection('clients')
      .where('deviceId', '==', deviceId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Dispositivo não encontrado' }, { status: 404 });
    }

    const docId = snapshot.docs[0].id;

    await db.collection('clients').doc(docId).update({
      online: status === 'online',
      lastSeen: new Date()
    });

    return NextResponse.json({ success: true, online: status === 'online' });

  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
