import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

// GET - Listar todos os clientes
export async function GET() {
  try {
    const snapshot = await db.collection('clients').get();
    const clients = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 });
  }
}

// POST - Adicionar novo cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, name, mac, serverUrl, username, password, userAgent, status, validade, contato, notes } = body;

    const docRef = await db.collection('clients').add({
      deviceId,
      name,
      mac,
      serverUrl: serverUrl || '',
      username: username || '',
      password: password || '',
      userAgent: userAgent || '',
      status: status || 'active',
      validade,
      contato: contato || '',
      notes: notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const doc = await docRef.get();
    return NextResponse.json({ id: doc.id, ...doc.data() }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 });
  }
}