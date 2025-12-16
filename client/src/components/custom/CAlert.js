/*********************************************************************
How to use this?
```
import React, { useRef } from 'react';

import CAlert from '../custom/CAlert';

// Alert
const alertRef = useRef();

alertRef.current.displayAlert('success', t('saveSuccess'));

<CAlert ref={alertRef} />
```
*********************************************************************/

import React, { useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

const CAlert = React.forwardRef((props, ref) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [severity, setSeverity] = useState("success");

  const displayAlert = (severity = "success", msg) => {
    setShowAlert(true);
    setAlertMsg(msg);
    setSeverity(severity);
    setTimeout(() => setShowAlert(false), 2000);
  };

  React.useImperativeHandle(ref, () => ({
    displayAlert,
  }));

  return (
    <Snackbar
      open={showAlert}
      autoHideDuration={6000}
      onClose={() => setShowAlert(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity={severity}>
        {alertMsg}
      </Alert>
    </Snackbar>
  );
});

export default CAlert;