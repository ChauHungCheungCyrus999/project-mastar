import React, { useRef, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { InputLabel, Container } from '@mui/material';
import { ThemeProvider } from '@mui/styles';
// Reference: https://xdsoft.net/jodit/
import JoditEditor from 'jodit-react';

import { useTranslation } from 'react-i18next';

const RichTextArea = ({ description, handleDescriptionChange, height=400 }) => {
  const { t } = useTranslation();
  const editor = useRef(null);

  const theme = useTheme();
  const storedTheme = localStorage.getItem('theme');

  const config = {
    readonly: false, // all options from https://xdsoft.net/jodit/docs/classes/config.Config.html
    toolbar: true,
    height: height,
    theme: storedTheme,
    buttons: [
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'ul', 'ol', 'outdent', 'indent', '|',
      'table', '|',
      'font', 'fontsize', 'brush', 'paragraph', 'align', '|',
      'superscript', 'subscript', '|',
      'copyformat', 'eraser', '|',
      'undo', 'redo', '|',
      'hr', 'selectall', 'print', 'source', 'fullsize'
    ]
  };

  useEffect(() => {
    if (editor.current) {
      // Set initial value
      editor.current.value = description;
    }
  }, [description]);
  
  return (
    <ThemeProvider theme={theme}>
      {/*<Container
        maxWidth={false}
        disableGutters
        sx={{
          borderColor: storedTheme === 'dark' ? '#5a5a5a' : 'lightGray',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: '0.3rem',
          minHeight: '200px',
          maxHeight: '510px',
          mb: '1rem',
          p: '0 0.5rem 0 1rem',
          overflow: 'hidden',
          '&:hover': {
            borderColor: storedTheme === 'dark' ? 'lightGray' : '#5a5a5a',
          },
          '&:focus-within': {
            borderColor: storedTheme === 'dark' ? '#ea80fc' : '#193f70',
          }
        }}
      >*/}
        <JoditEditor
          ref={editor}
          value={description}
          config={config}
          onBlur={newContent => handleDescriptionChange(newContent)}
        />
      {/*</Container>*/}
    </ThemeProvider>
  );
};

export default RichTextArea;