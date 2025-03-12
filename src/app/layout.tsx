import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ThemeRegistry from '../components/ThemeRegistry'
import Providers from '../components/Providers'
import { AppBar, Box, Container, Toolbar } from '@mui/material'
import Navigation from '../components/Navigation'
import Logo from '../components/Logo'
import UserProvider from '../components/UserProvider'
import { Toaster } from '@/components/ui/toaster'
import { CustomToastProvider } from '@/components/ui/custom-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TraderNickel',
  description: 'Algorithmic Trading Platform',
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
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CustomToastProvider>
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
          <Toaster />
        </CustomToastProvider>
      </body>
    </html>
  );
} 