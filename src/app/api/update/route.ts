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
    url: 'https://www.dropbox.com/scl/fi/wkcybny2u95ydjr4kz1wq/jrstreaming.apk?rlkey=zxo1ck6dnk4m0fpc5hvna1gd4&dl=1' // URL do novo APK
  };

  return NextResponse.json(updateInfo);
}
