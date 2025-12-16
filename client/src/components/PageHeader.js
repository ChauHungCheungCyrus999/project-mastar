
import React from 'react';
import { Typography } from '@mui/material';

const PageHeader = ({ title }) => {
  return (
    <Typography variant="h6" gutterBottom sx={{ fontSize: '24px', /*mb: '20px',*/ color: 'primary' }}>
      {title}
    </Typography>
  );
}

export default PageHeader;