import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

// PUT - Atualizar cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { deviceId, name, mac, serverUrl, username, password, status, validade, contato } = body;

    await db.collection('clients').doc(id).update({
      deviceId,
      name,
      mac,
      serverUrl: serverUrl || '',
      username,
      password,
      status,
      validade,
      contato: contato || '',
      updatedAt: new Date()
    });

    return NextResponse.json({ message: 'Cliente atualizado com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar cliente' }, { status: 500 });
  }
}

// DELETE - Excluir cliente
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.collection('clients').doc(id).delete();
    return NextResponse.json({ message: 'Cliente excluído com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir cliente' }, { status: 500 });
  }
}