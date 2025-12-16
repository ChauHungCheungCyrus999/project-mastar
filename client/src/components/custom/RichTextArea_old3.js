import React, { useRef, useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Container, IconButton, Tooltip, ButtonGroup, Menu, MenuItem } from '@mui/material';
import { ThemeProvider } from '@mui/styles';
import { useTranslation } from 'react-i18next';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import TextFormatIcon from '@mui/icons-material/TextFormat';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import SuperscriptIcon from '@mui/icons-material/Superscript';
import SubscriptIcon from '@mui/icons-material/Subscript';
import FormatIndentIncreaseIcon from '@mui/icons-material/FormatIndentIncrease';
import FormatIndentDecreaseIcon from '@mui/icons-material/FormatIndentDecrease';
import HighlightIcon from '@mui/icons-material/Highlight';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

const RichTextArea = ({ description, handleDescriptionChange, height = 400 }) => {
  const { t } = useTranslation();
  const editorRef = useRef(null);

  const theme = useTheme();
  const storedTheme = localStorage.getItem('theme');

  const [isFullScreen, setIsFullScreen] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [bgColorAnchorEl, setBgColorAnchorEl] = useState(null);
  const [fontSizeAnchorEl, setFontSizeAnchorEl] = useState(null);
  const [fontFamilyAnchorEl, setFontFamilyAnchorEl] = useState(null);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const saveCaretPosition = (context) => {
    const selection = window?.getSelection();
    if (selection?.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(context);
      preCaretRange.setEnd(range.startContainer, range.startOffset);
      const start = preCaretRange.toString().length;
      return start;
    }
    return 0; // Default to position 0 if no valid range is found
  };  

  const restoreCaretPosition = (context, offset) => {
    const range = document.createRange();
    const selection = window.getSelection();
    let charCount = 0;
    let nodeStack = [context];
    let node;
    let found = false;

    while (!found && (node = nodeStack.pop())) {
      if (node.nodeType === 3) {
        const nextCharCount = charCount + node.length;
        if (offset >= charCount && offset <= nextCharCount) {
          range.setStart(node, offset - charCount);
          range.setEnd(node, offset - charCount);
          found = true;
        }
        charCount = nextCharCount;
      } else {
        let i = node.childNodes.length;
        while (i--) {
          nodeStack.push(node.childNodes[i]);
        }
      }
    }
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleInput = () => {
    const content = editorRef.current.innerHTML;
    handleDescriptionChange(content);
  };

  useEffect(() => {
    if (editorRef.current) {
      const caretPosition = saveCaretPosition(editorRef?.current);
      editorRef.current.innerHTML = description || '';
      restoreCaretPosition(editorRef.current, caretPosition);
    }
  }, [description]);

  const openColorMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const openBgColorMenu = (event) => {
    setBgColorAnchorEl(event.currentTarget);
  };

  const openFontSizeMenu = (event) => {
    setFontSizeAnchorEl(event.currentTarget);
  };

  const openFontFamilyMenu = (event) => {
    setFontFamilyAnchorEl(event.currentTarget);
  };

  const closeColorMenu = () => {
    setAnchorEl(null);
  };

  const closeBgColorMenu = () => {
    setBgColorAnchorEl(null);
  };

  const closeFontSizeMenu = () => {
    setFontSizeAnchorEl(null);
  };

  const closeFontFamilyMenu = () => {
    setFontFamilyAnchorEl(null);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen]);

  return (
    <ThemeProvider theme={theme}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        position: isFullScreen ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        right: 0,
        bottom: '48px',
        zIndex: 9,
      }}>
        <ButtonGroup variant="outlined" aria-label="text formatting" style={{ flexWrap: 'wrap' }}>
          <Tooltip title={t('bold')}>
            <IconButton onClick={() => execCommand('bold')}>
              <FormatBoldIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('italic')}>
            <IconButton onClick={() => execCommand('italic')}>
              <FormatItalicIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('underline')}>
            <IconButton onClick={() => execCommand('underline')}>
              <FormatUnderlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('strikethrough')}>
            <IconButton onClick={() => execCommand('strikethrough')}>
              <StrikethroughSIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('superscript')}>
            <IconButton onClick={() => execCommand('superscript')}>
              <SuperscriptIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('subscript')}>
            <IconButton onClick={() => execCommand('subscript')}>
              <SubscriptIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('increaseIndent')}>
            <IconButton onClick={() => execCommand('indent')}>
              <FormatIndentIncreaseIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('decreaseIndent')}>
            <IconButton onClick={() => execCommand('outdent')}>
              <FormatIndentDecreaseIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('highlight')}>
            <IconButton onClick={() => execCommand('hiliteColor', 'yellow')}>
              <HighlightIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('unorderedList')}>
            <IconButton onClick={() => execCommand('insertUnorderedList')}>
              <FormatListBulletedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('orderedList')}>
            <IconButton onClick={() => execCommand('insertOrderedList')}>
              <FormatListNumberedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('alignLeft')}>
            <IconButton onClick={() => execCommand('justifyLeft')}>
              <FormatAlignLeftIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('alignCenter')}>
            <IconButton onClick={() => execCommand('justifyCenter')}>
              <FormatAlignCenterIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('alignRight')}>
            <IconButton onClick={() => execCommand('justifyRight')}>
              <FormatAlignRightIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('undo')}>
            <IconButton onClick={() => execCommand('undo')}>
              <UndoIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('redo')}>
            <IconButton onClick={() => execCommand('redo')}>
              <RedoIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('textColor')}>
            <IconButton onClick={openColorMenu}>
              <TextFormatIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={closeColorMenu}
          >
            <MenuItem onClick={() => { execCommand('foreColor', 'red'); closeColorMenu(); }}>Red</MenuItem>
            <MenuItem onClick={() => { execCommand('foreColor', 'green'); closeColorMenu(); }}>Green</MenuItem>
            <MenuItem onClick={() => { execCommand('foreColor', 'blue'); closeColorMenu(); }}>Blue</MenuItem>
          </Menu>
          <Tooltip title={t('backgroundColor')}>
            <IconButton onClick={openBgColorMenu}>
              <FormatColorFillIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={bgColorAnchorEl}
            open={Boolean(bgColorAnchorEl)}
            onClose={closeBgColorMenu}
          >
            <MenuItem onClick={() => { execCommand('hiliteColor', 'yellow'); closeBgColorMenu(); }}>Yellow</MenuItem>
            <MenuItem onClick={() => { execCommand('hiliteColor', 'lightgreen'); closeBgColorMenu(); }}>Light Green</MenuItem>
            <MenuItem onClick={() => { execCommand('hiliteColor', 'lightblue'); closeBgColorMenu(); }}>Light Blue</MenuItem>
          </Menu>
          <Tooltip title={t('fontSize')}>
            <IconButton onClick={openFontSizeMenu}>
              <TextFieldsIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={fontSizeAnchorEl}
            open={Boolean(fontSizeAnchorEl)}
            onClose={closeFontSizeMenu}
          >
            <MenuItem onClick={() => { execCommand('fontSize', '1'); closeFontSizeMenu(); }}>8</MenuItem>
            <MenuItem onClick={() => { execCommand('fontSize', '2'); closeFontSizeMenu(); }}>10</MenuItem>
            <MenuItem onClick={() => { execCommand('fontSize', '3'); closeFontSizeMenu(); }}>12</MenuItem>
            <MenuItem onClick={() => { execCommand('fontSize', '4'); closeFontSizeMenu(); }}>14</MenuItem>
            <MenuItem onClick={() => { execCommand('fontSize', '5'); closeFontSizeMenu(); }}>18</MenuItem>
            <MenuItem onClick={() => { execCommand('fontSize', '6'); closeFontSizeMenu(); }}>24</MenuItem>
            <MenuItem onClick={() => { execCommand('fontSize', '7'); closeFontSizeMenu(); }}>36</MenuItem>
          </Menu>
          <Tooltip title={t('fontFamily')}>
            <IconButton onClick={openFontFamilyMenu}>
              <FontDownloadIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={fontFamilyAnchorEl}
            open={Boolean(fontFamilyAnchorEl)}
            onClose={closeFontFamilyMenu}
          >
            <MenuItem onClick={() => { execCommand('fontName', 'Arial'); closeFontFamilyMenu(); }}>Arial</MenuItem>
            <MenuItem onClick={() => { execCommand('fontName', 'Courier New'); closeFontFamilyMenu(); }}>Courier New</MenuItem>
            <MenuItem onClick={() => { execCommand('fontName', 'Times New Roman'); closeFontFamilyMenu(); }}>Times New Roman</MenuItem>
          </Menu>
          <Tooltip title={isFullScreen ? t('exitFullScreen') : t('fullScreen')}>
            <IconButton onClick={toggleFullScreen}>
              {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
        </ButtonGroup>
      </div>
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          borderColor: storedTheme === 'dark' ? '#5a5a5a' : 'lightGray',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: '0.3rem',
          minHeight: isFullScreen ? 'calc(100vh - 48px)' : '200px',
          maxHeight: isFullScreen ? 'calc(100vh - 48px)' : '510px',
          mb: '1rem',
          p: '0.5rem',
          overflow: 'auto',
          position: isFullScreen ? 'fixed' : 'relative',
          top: isFullScreen ? '48px' : 'auto',
          left: isFullScreen ? 0 : 'auto',
          right: isFullScreen ? 0 : 'auto',
          bottom: isFullScreen ? 0 : 'auto',
          zIndex: isFullScreen ? 12000 : 'auto',
          '&:hover': {
            borderColor: storedTheme === 'dark' ? 'lightGray' : '#5a5a5a',
          },
          '&:focus-within': {
            borderColor: storedTheme === 'dark' ? '#ea80fc' : '#193f70',
          }
        }}
      >
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          style={{
            height: '100%',
            outline: 'none',
            whiteSpace: 'pre-wrap'
          }}
        />
      </Container>
    </ThemeProvider>
  );
};

export default RichTextArea;