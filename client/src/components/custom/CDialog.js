import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Button, Tooltip, Box, useMediaQuery, SwipeableDrawer,
  Typography
} from '@mui/material';
import { Share, Fullscreen, FullscreenExit, Close } from '@mui/icons-material';

import { useTranslation } from 'react-i18next';

import CAlert from './CAlert';
import CSwipeableDrawer from '../custom/CSwipeableDrawer';

const CDialog = ({
  mode, item, open=true, onClose, handleSubmit, handlePreview, handleDelete, taskId, title, children,
  activeStep, totalStep, handleBack, handleNext,
  maxWidth="xl"
}) => {
  const { t } = useTranslation();
  const alertRef = useRef();
  const isMobile = useMediaQuery('(max-width:600px)');

  // Share
  const handleShare = async (event) => {
    event.stopPropagation();
    const projectId = window.location.href.split("/")[4];
    const link = `${process.env.REACT_APP_CLIENT_HOST}/project/${projectId}/task/${taskId}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
        alertRef.current.displayAlert('success', `${t('copySuccess')}: ${link}`);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = link;
        textArea.style.position = "fixed";  // Avoid scrolling to bottom
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
          alertRef.current.displayAlert('success', `${t('copySuccess')}: ${link}`);
        } catch (err) {
          alertRef.current.displayAlert('error', t('copyFail'));
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      alertRef.current.displayAlert('error', t('copyFail'));
    }
  };

  // Full Screen
  const storedIsFullScreen = localStorage.getItem('isFullScreen') === 'true';
  const [isFullScreen, setIsFullScreen] = useState(storedIsFullScreen || isMobile);
  
  useEffect(() => {
    localStorage.setItem('isFullScreen', isFullScreen);
  }, [isFullScreen]);

  const handleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const renderDialogContent = (
    <>
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="subtitle2">{title}</Typography>

        <div>
          {(mode === "update" || mode === "share") && taskId && (
            <Tooltip title={t('share')} placement="top">
              <IconButton size="small" onClick={handleShare} sx={{ mr: 1 }}>
                <Share />
              </IconButton>
            </Tooltip>
          )}

          {!isMobile && (
            <Tooltip title={isFullScreen ? t('exitFullScreen') : t('fullScreen')} placement="top">
              <IconButton size="small" onClick={handleFullScreen}>
                {isFullScreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title={t('close')} placement="top">
            <IconButton size="small" onClick={onClose}>
              <Close />
            </IconButton>
          </Tooltip>
        </div>
      </DialogTitle>

      <DialogContent>
        {children}
      </DialogContent>

      {(mode === "create" || mode === "update" || mode === "duplicate" || mode === "share") && (
        <DialogActions>
          {activeStep > 0 && handleBack && handleNext && (
            <Button onClick={handleBack}>
              {t('back')}
            </Button>
          )}
          {activeStep !== 1 && handleBack && handleNext && (
            <Button onClick={handleNext}>
              {t('next')}
            </Button>
          )}

          {item === "announcement" && handlePreview && (
            <Button variant="contained" color="secondary" onClick={handlePreview}>{t('preview')}</Button>
          )}

          {handleDelete && taskId && mode !== "share" && (
            <Button variant="contained" color="error" onClick={handleDelete}>{t('delete')}</Button>
          )}

          {item === "event" && handleDelete && (
            <Button variant="contained" color="error" onClick={handleDelete}>{t('delete')}</Button>
          )}
          
          {!handleBack && !handleNext && (
            <Button variant="outlined" onClick={onClose}>
              {t('cancel')}
            </Button>
          )}

          {item==="project" && mode === "create" && activeStep === totalStep-1 && handleBack && handleNext && handleSubmit && (
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              {(mode === "create" || mode === "duplicate") ? t('create') : t('save')}
            </Button>
          )}

          {item==="task" && (mode === "create" || mode === "duplicate") && (
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              {(mode === "create" || mode === "duplicate") ? t('create') : t('save')}
            </Button>
          )}

          {(item==="event" || item==="announcement") && mode === "create" && handleSubmit && (
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              {t('create')}
            </Button>
          )}

          {(mode === "update" || mode === "share") && handleSubmit && (
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              {t('save')}
            </Button>
          )}
        </DialogActions>
      )}

      <CAlert ref={alertRef} />
    </>
  );

  return isMobile ? (
    <CSwipeableDrawer
      open={open}
      onOpen={() => {}}
      onClose={onClose}
      height="95%"
    >
      {renderDialogContent}
    </CSwipeableDrawer>
  ) : (
    <Dialog
      maxWidth={maxWidth}
      fullWidth
      open={open}
      fullScreen={isFullScreen}
      disableEscapeKeyDown
      onClick={(event) => event.stopPropagation()}
    >
      {renderDialogContent}
    </Dialog>
  );
};

export default CDialog;
