/*import React from 'react';
import './Hexagon.css';

import { useTranslation } from 'react-i18next';

const Hexagon = () => {
  const { t } = useTranslation();
  
  return (
    <div className="container">
      <div className="card">
        <img src="" alt="Image 1" />
        <div className="overlay"></div>
      </div>

      <div className="card">
        <img src="" alt="Image 2" />
        <div className="overlay"></div>
      </div>

      <div className="card">
        <img src="" alt="Image 3" />
        <div className="overlay"></div>
      </div>

      <div className="card">
        <img src="/logo/schedule.jpg" alt="Image 4" />
        <div className="overlay">{t('schedule')}</div>
      </div>

      <div className="card">
        <img src="/logo/resource.jpg" alt="Image 5" />
        <div className="overlay">{t('resource')}</div>
      </div>

      <div className="card">
        <img src="/logo/budget.jpg" alt="Image 6" />
        <div className="overlay">{t('budget')}</div>
      </div>

      <div className="card">
        <img src="/logo/quality.jpg" alt="Image 7" />
        <div className="overlay">{t('quality')}</div>
      </div>

      <div className="card">
        <img src="/logo/scope.jpg" alt="Image 8" />
        <div className="overlay">{t('scope')}</div>
      </div>

      <div className="card">
        <img src="/logo/risk.jpg" alt="Image 9" />
        <div className="overlay">{t('risk')}</div>
      </div>
    </div>
  );
};

export default Hexagon;*/


import React, { useState } from 'react';
import './Hexagon.css';
import { useTranslation } from 'react-i18next';

const Hexagon = ({ onCardHover }) => {
  const { t } = useTranslation();
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleCardHover = (card) => {
    setHoveredCard(card);
    onCardHover(card);
  };

  const handleCardLeave = () => {
    setHoveredCard(null);
    onCardHover(null);
  };

  return (
    <div className="container">
      <div className="card">
        <img src="" alt="Image 1" />
        <div className="overlay"></div>
      </div>

      <div className="card">
        <img src="" alt="Image 2" />
        <div className="overlay"></div>
      </div>

      <div className="card">
        <img src="" alt="Image 3" />
        <div className="overlay"></div>
      </div>

      <div
        className={`card ${hoveredCard === 'schedule' ? 'active' : ''}`}
        onMouseEnter={() => handleCardHover(t('schedule'))}
        onMouseLeave={handleCardLeave}
      >
        <img src="/logo/schedule.jpg" alt="Image 4" />
        <div className="overlay">{t('schedule')}</div>
      </div>

      <div
        className={`card ${hoveredCard === 'resource' ? 'active' : ''}`}
        onMouseEnter={() => handleCardHover(t('resource'))}
        onMouseLeave={handleCardLeave}
      >
        <img src="/logo/resource.jpg" alt="Image 5" />
        <div className="overlay">{t('resource')}</div>
      </div>

      <div
        className={`card ${hoveredCard === 'budget' ? 'active' : ''}`}
        onMouseEnter={() => handleCardHover(t('budget'))}
        onMouseLeave={handleCardLeave}
      >
        <img src="/logo/budget.jpg" alt="Image 6" />
        <div className="overlay">{t('budget')}</div>
      </div>

      <div
        className={`card ${hoveredCard === 'quality' ? 'active' : ''}`}
        onMouseEnter={() => handleCardHover(t('quality'))}
        onMouseLeave={handleCardLeave}
      >
        <img src="/logo/quality.jpg" alt="Image 7" />
        <div className="overlay">{t('quality')}</div>
      </div>

      <div
        className={`card ${hoveredCard === 'scope' ? 'active' : ''}`}
        onMouseEnter={() => handleCardHover(t('scope'))}
        onMouseLeave={handleCardLeave}
      >
        <img src="/logo/scope.jpg" alt="Image 8" />
        <div className="overlay">{t('scope')}</div>
      </div>

      <div
        className={`card ${hoveredCard === 'risk' ? 'active' : ''}`}
        onMouseEnter={() => handleCardHover(t('risk'))}
        onMouseLeave={handleCardLeave}
      >
        <img src="/logo/risk.jpg" alt="Image 9" />
        <div className="overlay">{t('risk')}</div>
      </div>
    </div>
  );
};

export default Hexagon;