import React from 'react';
import { InputLabel, Container } from '@mui/material';
import MUIRichTextEditor from "mui-rte";
import { ThemeProvider }  from '@mui/styles';
import { useTheme } from '@mui/material/styles';

import { useTranslation } from 'react-i18next';

const RichTextArea = ({ description, handleDescriptionChange }) => {
  const { t } = useTranslation();

  const theme = useTheme();
  const storedTheme = localStorage.getItem('theme');

  return (
    <ThemeProvider theme={theme}>
      <InputLabel id="description-label" sx={{ mt: '1rem' }}>{t('description')}</InputLabel>
      <Container
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
      >
        <MUIRichTextEditor
          label={t('writeTaskDescription')}
          name="description"
          defaultValue={description}
          //inlineToolbar={true}
          controls={[
            'title',
            'bold',
            'italic',
            'underline',
            'strikethrough',
            'highlight',
            //'link',
            //'media',
            'numberList',
            'bulletList',
            'quote',
            'code',
            'clear',
            'undo',
            'redo',
            //'save'
          ]}
          //maxLength="5000"
          onChange={(value) => handleDescriptionChange(value)}
        />
      </Container>
    </ThemeProvider>
  );
};

export default RichTextArea;