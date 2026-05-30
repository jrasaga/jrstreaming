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
    url: 'https://www.dropbox.com/scl/fi/fav0isv9zrrutoldxt7mc/jrstreaming25.apk?rlkey=nkwrh2dvbczufcv6y6lq4ixje&st=zix7gd47&dl=1' // URL do novo APK
  };

  return NextResponse.json(updateInfo);
}
