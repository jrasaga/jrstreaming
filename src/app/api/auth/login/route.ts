import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  // Credenciais fixas do admin
  const ADMIN_EMAIL = 'admin@iptv.com';
  const ADMIN_PASSWORD = 'admin123';

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return NextResponse.json({ 
      success: true, 
      token: 'admin_token_2024',
      message: 'Login realizado com sucesso' 
    });
  }

  return NextResponse.json(
    { success: false, message: 'Email ou senha inválidos' },
    { status: 401 }
  );
}