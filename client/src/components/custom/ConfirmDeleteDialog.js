import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

import { useTranslation } from 'react-i18next';

const ConfirmDeleteDialog = ({ title, content, open, onCancel, onConfirm }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>
        <Typography variant="subtitle2">{title}</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">{content}</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onCancel}>{t('cancel')}</Button>
        <Button variant="contained" onClick={onConfirm} color="error">{t('delete')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;