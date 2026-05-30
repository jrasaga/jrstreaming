import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const packageName = request.nextUrl.searchParams.get('packageName');

  if (!packageName) {
    return NextResponse.json({ error: 'Package name não informado' }, { status: 400 });
  }

  // Configuração da atualização
  const updateInfo = {
    packageName: 'com.jr.streaming',
    versionCode: 25, // Aumente este número quando tiver uma nova versão
    url: 'https://drive.google.com/uc?export=download&id=1nztqX8D8mTT1N12P-Tx0quMucZNqu5W1' // URL do novo APK
  };

  return NextResponse.json(updateInfo);
}
