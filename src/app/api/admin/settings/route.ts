import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();

    const updated = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: {
        ...payload,
      },
      create: {
        id: 'default',
        ...payload,
      },
    });

    await prisma.adminActivityLog.create({
      data: {
        adminUserId: session.id,
        action: 'SETTINGS_UPDATED',
        entity: 'SiteSettings',
        entityId: 'default',
        metadata: JSON.stringify(payload),
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ success: false, message: 'Server error updating settings' }, { status: 500 });
  }
}
