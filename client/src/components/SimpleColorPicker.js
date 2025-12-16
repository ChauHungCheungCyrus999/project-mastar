import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Stack, IconButton, Typography, Tooltip } from '@mui/material';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';

import { useTranslation } from 'react-i18next';

//const colors = ['#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', '#00FFFF', '#800080', '#888888', 'transparent'];
const colors = [
  '#ef5350',
  '#ff9800',
  '#efcf50',
  '#4caf50',
  '#03a9f4',
  '#ba68c8',
  '#888888',
  'transparent'
];

const SimpleColorPicker = ({ color, handleColor, displayPreviousColor=true, disabled }) => {
  const { t } = useTranslation();

  const projectId = window.location.href.split("/")[4];

  const [selectedColor, setSelectedColor] = useState(color || '');
  const [usedColors, setUsedColors] = useState([]);

  useEffect(() => {
    const fetchUsedColors = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/task/project/${projectId}/color`);
        setUsedColors(response.data);
      } catch (error) {
        console.error('Error fetching used colors:', error);
      }
    };

    if (projectId) {
      fetchUsedColors();
    }
  }, [projectId]);

  const handleSelectColor = (color) => {
    if (!disabled) {
      setSelectedColor(color);
      handleColor({ hex: color });
    }
  };

  const handleCancel = () => {
    if (!disabled) {
      setSelectedColor('');
      handleColor({ hex: '' });
    }
  };

  return (
    <Box style={{ display: 'block', marginBottom: "1rem" }}>
      <Stack direction="row" alignItems="center" sx={{ mb: '10px' }}>
        {colors.map((color) => (
          <div
            key={color}
            onClick={() => handleSelectColor(color)}
            style={{
              backgroundColor: color,
              width: '32px',
              height: '32px',
              margin: '2px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              border: selectedColor === color ? '3px solid #333' : '2px solid #ccc',
              borderRadius: '5px',
              transition: 'transform 0.2s',
              pointerEvents: disabled ? 'none' : 'auto'
            }}
          ></div>
        ))}

        <Box style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => handleSelectColor(e.target.value)}
            style={{
              width: '32px',
              height: '32px',
              margin: '2px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              pointerEvents: disabled ? 'none' : 'auto'
            }}
            disabled={disabled}
          />
        </Box>

        <Tooltip title={t('clear')}>
          <IconButton
            size="small"
            onClick={handleCancel}
            style={{
              margin: '2px',
              color: 'gray',
              background: '#f5f5f5',
              borderRadius: '8px', // Rounded square
              display: 'flex',
              alignItems: 'center',
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
            disabled={disabled}
          >
            <DoDisturbIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {displayPreviousColor && (
        <Box sx={{ display: "block" }}>
          <Typography variant="caption">{t('prevUsedColor')}{t('colon')}</Typography>
          <Box style={{ display: 'flex', flexWrap: 'wrap' }}>
            {usedColors.map((color) => (
              <div
                key={color}
                onClick={() => handleSelectColor(color)}
                style={{
                  backgroundColor: color,
                  width: '30px',
                  height: '30px',
                  margin: '2px',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  borderRadius: '5px',
                  border: selectedColor === color ? '3px solid #333' : '2px solid #ccc',
                  pointerEvents: disabled ? 'none' : 'auto'
                }}
              ></div>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SimpleColorPicker;
