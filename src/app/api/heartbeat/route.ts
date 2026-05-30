import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get('deviceId');
    const action = request.nextUrl.searchParams.get('action'); // 'start' ou 'stop'

    if (!deviceId) {
      return NextResponse.json({ error: 'Device ID não informado' }, { status: 400 });
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
    const client = snapshot.docs[0].data();

    if (client.status !== 'active') {
      return NextResponse.json({ success: false, status: client.status });
    }

    if (action === 'stop') {
      // APK foi fechado
      await db.collection('clients').doc(docId).update({
        watching: false
      });
    } else {
      // APK está aberto (start)
      await db.collection('clients').doc(docId).update({
        lastHeartbeat: new Date(),
        watching: true
      });
    }

    return NextResponse.json({ success: true, status: 'active' });

  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}