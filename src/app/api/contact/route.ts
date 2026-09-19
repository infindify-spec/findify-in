import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    const newMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject: subject || 'General Inquiry',
        message,
        status: 'UNREAD',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your inquiry has been submitted. We will respond within 24 hours.',
      id: newMessage.id,
    });
  } catch (error) {
    console.error('Contact message submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error saving contact inquiry' },
      { status: 500 }
    );
  }
}
