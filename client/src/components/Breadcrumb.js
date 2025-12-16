import React from 'react';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

import { useTranslation } from 'react-i18next';

const Breadcrumb = ({ items }) => {
  const { t } = useTranslation();

  return (
    <Breadcrumbs aria-label={t('breadcrumb')} sx={{ color: '#777', mb: 1 }}>
      {items.map((item, index) => (
        item.href ? (
          <Link
            variant='body2'
            key={index}
            underline="hover"
            href={item.href}
            color='#777'
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            {item.icon}
            <Typography variant='body2' sx={{ ml: 0.5 }}>
              {t(item.label)}
            </Typography>
          </Link>
        ) : (
          <Typography key={index} variant='body2' sx={{ display: 'flex', alignItems: 'center' }}>
            {item.icon}
            <Typography variant='body2' sx={{ ml: 0.5 }}>
              {t(item.label)}
            </Typography>
          </Typography>
        )
      ))}
    </Breadcrumbs>
  );
};

export default Breadcrumb;
