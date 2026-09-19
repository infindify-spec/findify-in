import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { Role } from '@prisma/client';
import { prisma } from './prisma';

const JWT_SECRET = process.env.AUTH_SECRET || 'findify_production_super_secret_jwt_key_987654321_in';

export interface CustomerPayload {
  id: string;
  email: string;
  name: string;
  type: 'CUSTOMER';
}

export interface AdminPayload {
  id: string;
  email: string;
  name: string;
  role: Role;
  type: 'ADMIN';
}

export function signCustomerToken(payload: Omit<CustomerPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'CUSTOMER' }, JWT_SECRET, { expiresIn: '7d' });
}

export function signAdminToken(payload: Omit<AdminPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'ADMIN' }, JWT_SECRET, { expiresIn: '1d' });
}

export function verifyToken<T>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}

export async function getCustomerSession(): Promise<CustomerPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('customer_token')?.value;
  if (!token) return null;
  const decoded = verifyToken<CustomerPayload>(token);
  return decoded && decoded.type === 'CUSTOMER' ? decoded : null;
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  const decoded = verifyToken<AdminPayload>(token);
  if (!decoded || decoded.type !== 'ADMIN') return null;

  try {
    const admin = await prisma.adminUser.findFirst({
      where: {
        OR: [{ id: decoded.id }, { email: decoded.email }],
      },
    });
    if (!admin || !admin.isActive) return null;
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      type: 'ADMIN',
    };
  } catch {
    return decoded;
  }
}

