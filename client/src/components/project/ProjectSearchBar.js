import React from 'react';
import { InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import { useTranslation } from 'react-i18next';

function ProjectSearchBar({ searchQuery, handleSearchQueryChange }) {
  const { t } = useTranslation();

  return (
    <div style={{ position: 'relative', marginLeft: '1rem', marginRight: '1rem' }}>
      <div style={{ position: 'absolute', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '2rem'}}>
        <SearchIcon />
      </div>
      <InputBase
        placeholder={t('searchProject')}
        value={searchQuery}
        onChange={handleSearchQueryChange}
        style={{ paddingLeft: '2rem' }}
      />
    </div>
  );
}

export default ProjectSearchBar;