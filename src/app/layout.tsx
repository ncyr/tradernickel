import './globals.css'
import { Inter } from 'next/font/google'
import { AppBar, Box, Container, Toolbar } from '@mui/material'
import ThemeRegistry from '../components/ThemeRegistry'
import Logo from '../components/Logo'
import Navigation from '../components/Navigation'
import AuthProvider from '../components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Trader Nickel - Automated Trading Platform',
  description: 'Professional automated trading platform for cryptocurrency and traditional markets',
  icons: {
    icon: [
      {
        url: '/api/favicon',
        sizes: '32x32',
      }
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeRegistry>
          <AuthProvider>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <AppBar 
                position="sticky" 
                elevation={0}
                sx={{
                  backgroundColor: 'background.paper',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Container maxWidth="xl">
                  <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0 } }}>
                    <Logo size="medium" />
                    <Navigation />
                  </Toolbar>
                </Container>
              </AppBar>
              <Box
                component="main"
                sx={{
                  flex: 1,
                  py: 4,
                  backgroundColor: 'background.default',
                }}
              >
                <Container maxWidth="xl">
                  {children}
                </Container>
              </Box>
              <Box
                component="footer"
                sx={{
                  py: 3,
                  px: 2,
                  mt: 'auto',
                  backgroundColor: 'background.paper',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Container maxWidth="xl">
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Logo size="small" />
                    <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      © {new Date().getFullYear()} Trader Nickel. All rights reserved.
                    </Box>
                  </Box>
                </Container>
              </Box>
            </Box>
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  )
} 