import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signAdminToken, getAdminSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;

  try {
    const cookieStore = await cookies();

    if (action === 'login') {
      const { email, password } = await req.json();

      const admin = await prisma.adminUser.findUnique({ where: { email } });
      if (!admin || !admin.isActive) {
        return NextResponse.json({ success: false, message: 'Invalid admin credentials or inactive account' }, { status: 400 });
      }

      const isValid = await bcrypt.compare(password, admin.passwordHash);
      if (!isValid) {
        return NextResponse.json({ success: false, message: 'Invalid admin credentials' }, { status: 400 });
      }

      const token = signAdminToken({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      });

      cookieStore.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60,
        path: '/',
      });

      // Audit Log
      await prisma.adminActivityLog.create({
        data: {
          adminUserId: admin.id,
          action: 'ADMIN_LOGIN',
          entity: 'AdminUser',
          entityId: admin.id,
          metadata: JSON.stringify({ email: admin.email, role: admin.role }),
        },
      });

      return NextResponse.json({
        success: true,
        admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
      });
    }

    if (action === 'logout') {
      cookieStore.delete('admin_token');
      return NextResponse.json({ success: true, message: 'Logged out' });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 404 });
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json({ success: false, message: 'Server auth error' }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;

  if (action === 'me') {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, admin: null });
    }
    return NextResponse.json({ success: true, admin: session });
  }

  return NextResponse.json({ success: false, message: 'Invalid endpoint' }, { status: 404 });
}
