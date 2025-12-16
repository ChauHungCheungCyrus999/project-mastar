import React, { useRef, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/styles';
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; // Light theme styling
import 'quill/dist/quill.bubble.css'; // Dark theme styling
import './quillCustomFonts.css';
import { useTranslation } from 'react-i18next';

// Register custom fonts
const Font = Quill.import('formats/font');
Font.whitelist = ['arial', 'roboto', 'calibri', 'courier', 'georgia', 'lucida', 'open', 'tahoma', 'times', 'trebuchet', 'verdana'];
Quill.register(Font, true);

const RichTextArea = ({ description, handleDescriptionChange, height = 400, disabled }) => {
  const { t } = useTranslation();
  const editorRef = useRef(null); // HTML container ref
  const quillRef = useRef(null); // Quill instance ref

  const theme = useTheme();
  const storedTheme = localStorage.getItem('theme') || 'light'; // Default to light theme if none is set

  useEffect(() => {
    if (!quillRef.current) {
      // Initialize Quill editor
      quillRef.current = new Quill(editorRef.current, {
        //theme: storedTheme === 'dark' ? 'bubble' : 'snow', // Use dark or light theme
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            //[{ 'header': 1 }, { 'header': 2 }],               // custom button values
            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ 'font': Font.whitelist }],

            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme

            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote', 'code-block'],

            [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
            [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
            
            //[{ 'direction': 'rtl' }],                         // text direction

            [{ 'align': [] }],

            ['link', 'image', 'video'/*, 'formula'*/],
            
            ['clean']                                         // remove formatting button
          ],
        },
        placeholder: t('writeTaskDescription'), // Placeholder text
      });

      quillRef.current.enable(!disabled);

      // Set initial content
      if (description) {
        quillRef.current.clipboard.dangerouslyPasteHTML(description);
      }

      // Listen for content changes
      quillRef.current.on('text-change', () => {
        const newContent = quillRef.current.root.innerHTML;
        handleDescriptionChange(newContent);
      });
    }
  }, [description, storedTheme, handleDescriptionChange, t]);

  useEffect(() => {
    // Update the content when `description` prop changes
    if (quillRef.current && description !== quillRef.current.root.innerHTML) {
      quillRef.current.clipboard.dangerouslyPasteHTML(description);
    }
  }, [description]);

  return (
    <ThemeProvider theme={theme}>
      <div ref={editorRef} style={{ height: `${height}px` }} />
    </ThemeProvider>
  );
};

export default RichTextArea;
