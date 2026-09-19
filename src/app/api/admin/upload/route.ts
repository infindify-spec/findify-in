import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Only JPEG, PNG, WebP, AVIF or GIF images are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: 'File size must be under 10MB' },
        { status: 400 }
      );
    }

    // 1. Check if ImgBB API key is provided
    const imgbbKey = process.env.IMGBB_API_KEY;
    if (imgbbKey) {
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      const body = new URLSearchParams();
      body.append('image', base64);

      const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      const imgbbData = await imgbbRes.json();
      if (imgbbData?.data?.url) {
        return NextResponse.json({ success: true, url: imgbbData.data.url });
      }
    }

    // 2. Check if Cloudinary is configured
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'findify_preset';
    if (cloudName) {
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      const dataUri = `data:${file.type};base64,${base64}`;

      const cloudFd = new FormData();
      cloudFd.append('file', dataUri);
      cloudFd.append('upload_preset', uploadPreset);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: cloudFd,
      });
      const cloudData = await cloudRes.json();
      if (cloudData?.secure_url) {
        return NextResponse.json({ success: true, url: cloudData.secure_url });
      }
    }

    // 3. Try local disk write (for local dev)
    try {
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'products');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filename = `product-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filepath = join(uploadDir, filename);

      const bytes = await file.arrayBuffer();
      await writeFile(filepath, Buffer.from(bytes));
      return NextResponse.json({ success: true, url: `/uploads/products/${filename}` });
    } catch (fsErr) {
      console.warn('Local filesystem write unavaliable (Serverless/Vercel environment):', fsErr);
      // Fallback: Convert file to Data URI so upload succeeds seamlessly on Vercel without throwing an error!
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      const dataUri = `data:${file.type};base64,${base64}`;
      return NextResponse.json({ success: true, url: dataUri });
    }
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}

