import './globals.css'
import { Inter } from 'next/font/google'
import { AppBar, Box, Container, Toolbar } from '@mui/material'
import ThemeRegistry from '../components/ThemeRegistry'
import Logo from '../components/Logo'
import Navigation from '../components/Navigation'
import Providers from '../components/Providers'
import UserProvider from '../components/UserProvider'

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
          <UserProvider>
            <Providers>
              <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <AppBar 
                    position="static" 
                    elevation={0}
                    sx={{ 
                      zIndex: 2,
                      bgcolor: 'background.paper',
                      borderBottom: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Container maxWidth={false}>
                      <Toolbar 
                        disableGutters 
                        sx={{ 
                          minHeight: { xs: 56, sm: 64 },
                          gap: 2,
                          px: { xs: 1, sm: 2 },
                        }}
                      >
                        <Logo />
                        <Box sx={{ flexGrow: 1 }} />
                        <Navigation variant="user-menu" />
                      </Toolbar>
                    </Container>
                  </AppBar>
                  <Box sx={{ display: 'flex', flexGrow: 1 }}>
                    <Navigation variant="sidebar" />
                    <Container 
                      component="main" 
                      maxWidth={false} 
                      sx={{ 
                        flexGrow: 1,
                        py: 3,
                        px: { xs: 2, sm: 3 },
                        bgcolor: 'background.default',
                      }}
                    >
                      {children}
                    </Container>
                  </Box>
                </Box>
              </Box>
            </Providers>
          </UserProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
} 