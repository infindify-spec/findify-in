import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signCustomerToken, getCustomerSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;

  try {
    const cookieStore = await cookies();

    if (action === 'register') {
      const { email, password, name, phone } = await req.json();

      if (!email || !password || !name) {
        return NextResponse.json({ success: false, message: 'Missing fields' }, { status: 400 });
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, passwordHash, name, phone },
      });

      const token = signCustomerToken({ id: user.id, email: user.email, name: user.name });

      cookieStore.set('customer_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });

      return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
    }

    if (action === 'login') {
      const { email, password } = await req.json();

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 400 });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 400 });
      }

      const token = signCustomerToken({ id: user.id, email: user.email, name: user.name });

      cookieStore.set('customer_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });

      return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
    }

    if (action === 'logout') {
      cookieStore.delete('customer_token');
      return NextResponse.json({ success: true, message: 'Logged out' });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 404 });
  } catch (error) {
    console.error('Customer auth error:', error);
    return NextResponse.json({ success: false, message: 'Server auth error' }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;

  if (action === 'me') {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ success: false, user: null });
    }
    return NextResponse.json({ success: true, user: session });
  }

  return NextResponse.json({ success: false, message: 'Invalid endpoint' }, { status: 404 });
}
