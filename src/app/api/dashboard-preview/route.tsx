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
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#f5f7fa',
            padding: 40,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              backgroundColor: 'white',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 24px',
                backgroundColor: '#1a237e',
                color: 'white',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: '#00838f',
                  marginRight: 12,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
                </svg>
              </div>
              <div style={{ fontWeight: 'bold', fontSize: 20 }}>
                Trader Nickel Dashboard
              </div>
            </div>

            {/* Content */}
            <div style={{ display: 'flex', flexDirection: 'column', padding: 24 }}>
              {/* Stats Row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 16,
                    backgroundColor: 'white',
                    borderRadius: 8,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    width: '22%',
                    border: '1px solid rgba(26, 35, 126, 0.2)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      color: '#546e7a',
                      marginBottom: 8,
                    }}
                  >
                    Active Bots
                  </div>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#1a237e',
                    }}
                  >
                    3
                  </div>
                </div>
                
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 16,
                    backgroundColor: 'white',
                    borderRadius: 8,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    width: '22%',
                    border: '1px solid rgba(46, 125, 50, 0.2)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      color: '#546e7a',
                      marginBottom: 8,
                    }}
                  >
                    Total Trades
                  </div>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#2e7d32',
                    }}
                  >
                    127
                  </div>
                </div>
                
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 16,
                    backgroundColor: 'white',
                    borderRadius: 8,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    width: '22%',
                    border: '1px solid rgba(0, 131, 143, 0.2)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      color: '#546e7a',
                      marginBottom: 8,
                    }}
                  >
                    Today's Profit
                  </div>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#00838f',
                    }}
                  >
                    $2.34
                  </div>
                </div>
                
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 16,
                    backgroundColor: 'white',
                    borderRadius: 8,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    width: '22%',
                    border: '1px solid rgba(211, 47, 47, 0.2)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      color: '#546e7a',
                      marginBottom: 8,
                    }}
                  >
                    Total Profit
                  </div>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#d32f2f',
                    }}
                  >
                    $15.67
                  </div>
                </div>
              </div>

              {/* Title */}
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  marginBottom: 16,
                  textAlign: 'center',
                }}
              >
                Trader Nickel - Automated Trading Platform
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to generate dashboard preview' }, { status: 500 });
  }
} 