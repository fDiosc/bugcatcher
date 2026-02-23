import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { images } = body; // Expects an array of base64 strings

        if (!images || !Array.isArray(images) || images.length === 0) {
            return NextResponse.json({ error: 'No images provided' }, { status: 400 });
        }

        const savedPaths: string[] = [];

        for (const base64Str of images) {
            // Validate and extract base64 data
            const matches = base64Str.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
                console.warn('Invalid base64 string provided to upload');
                continue;
            }

            const ext = matches[1];
            const data = matches[2];
            const buffer = Buffer.from(data, 'base64');
            const filename = crypto.randomUUID() + '.' + ext;

            // Upload to Vercel Blob
            const blob = await put(`uploads/${filename}`, buffer, {
                access: 'public',
                contentType: `image/${ext}`,
            });

            savedPaths.push(blob.url);
        }

        return NextResponse.json({ success: true, paths: savedPaths }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
            }
        });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Upload failed' }, {
            status: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, data-project',
        },
    });
}
