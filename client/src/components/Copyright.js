import { Box, Typography, Link } from '@mui/material';

import { useTranslation } from 'react-i18next';

function Copyright() {
  const { t } = useTranslation();
  
  return (
    <Box component="footer" sx={{ py: 1 }}>
      <Typography variant="body2" color="text.secondary" align="center">
        {t('copyright')}
        {' © '}
        <Link color="inherit" href="/">
          {t('appName')}
        </Link>{' '}
        {new Date().getFullYear()}
        {/*{'.'}*/}
      </Typography>
    </Box>
  );
}

export default Copyright;