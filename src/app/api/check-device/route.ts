import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const deviceId = request.nextUrl.searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json(
        { exists: false, status: 'not_found', message: 'Device ID não informado' },
        { status: 400 }
      );
    }

    const snapshot = await db
      .collection('clients')
      .where('deviceId', '==', deviceId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({
        exists: false,
        status: 'not_found',
        message: 'Dispositivo não encontrado'
      });
    }

    const client = snapshot.docs[0].data();
    const docId = snapshot.docs[0].id;

    // Verificar se expirou
    if (client.validade) {
      const validadeDate = new Date(client.validade);
      const now = new Date();
      if (validadeDate < now && client.status === 'active') {
        await db.collection('clients').doc(docId).update({
          status: 'expired',
          updatedAt: new Date()
        });
        client.status = 'expired';
      }
    }

    return NextResponse.json({
      exists: true,
      status: client.status,
      client: {
        username: client.username,
        password: client.password,
        validade: client.validade,
        status: client.status,
        name: client.name,
        mac: client.mac,
        serverUrl: client.serverUrl || '',
        userAgent: client.userAgent || ''
      }
    });

  } catch (error) {
    return NextResponse.json(
      { exists: false, status: 'error', message: 'Erro interno' },
      { status: 500 }
    );
  }
}