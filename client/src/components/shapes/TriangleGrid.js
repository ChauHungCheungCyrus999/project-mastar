// Reference: https://stackoverflow.com/questions/32239011/sass-css-folding-triangles-in-hexagon

import React from 'react';
import "./TriangleGrid.css";

const TriangleGrid = () => {
  return (
    <div className="folding-hex">
      <div className="rotator">
        <div className="triangle"></div>
      </div>
      <div className="rotator">
        <div className="triangle"></div>
      </div>
      <div className="rotator">
        <div className="triangle"></div>
      </div>
      <div className="rotator">
        <div className="triangle"></div>
      </div>
      <div className="rotator">
        <div className="triangle"></div>
      </div>
      <div className="rotator">
        <div className="triangle"></div>
      </div>
    </div>
  );
};

export default TriangleGrid;