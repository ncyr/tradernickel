import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';

interface DataCardProps {
  title: string;
  value: string | number;
  valueColor?: string;
  linkText?: string;
  linkHref?: string;
  icon?: string;
}

const DataCard: React.FC<DataCardProps> = ({
  title,
  value,
  valueColor,
  linkText,
  linkHref,
  icon,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
      className="data-card"
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon && (
            <Box sx={{ fontSize: '1.8rem', mr: 1 }}>
              {icon}
            </Box>
          )}
          <Typography variant="h6" component="h2" color="text.primary">
            {title}
          </Typography>
        </Box>
        <Typography
          variant="h4"
          component="p"
          color={valueColor || 'text.primary'}
          sx={{ fontWeight: 'bold', mb: 1 }}
        >
          {value}
        </Typography>
      </CardContent>
      
      {linkText && linkHref && (
        <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
          <Link href={linkHref} passHref>
            <MuiLink underline="hover" sx={{ fontSize: '0.875rem' }}>
              {linkText}
            </MuiLink>
          </Link>
        </CardActions>
      )}
    </Card>
  );
};

export default DataCard; 