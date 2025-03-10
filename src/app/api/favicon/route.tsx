import { NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1a237e 0%, #00838f 100%)',
            borderRadius: '20%',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="white"
          >
            <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
          </svg>
        </div>
      ),
      {
        width: 32,
        height: 32,
      }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to generate favicon' }, { status: 500 });
  }
} 