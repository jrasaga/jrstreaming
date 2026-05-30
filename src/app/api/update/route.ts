import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const packageName = request.nextUrl.searchParams.get('packageName');

  if (!packageName) {
    return NextResponse.json({ error: 'Package name não informado' }, { status: 400 });
  }

  const updateInfo = {
    packageName: 'com.jr.streaming',
    versionCode: 25,
    url: 'https://www.dropbox.com/scl/fi/i43cm1830l2l6trk42tva/jrstreaming.apk?rlkey=g53j00cglo4typbgtg06rmyw5&dl=1'
  };

  return NextResponse.json(updateInfo);
}