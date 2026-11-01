import React from 'react';
import './AppDownload.css';

const AppDownload = () => {
  return (
    <div className='app-download' id='app-download'>
      <p>For Better Experience Download <br /> <span className="highlight-text">Fodoos App</span></p>
      <div className="app-download-platforms">
        <div className="store-badge google-play">
          <div className="badge-icon">▶</div>
          <div className="badge-text">
            <span className="badge-small">GET IT ON</span>
            <span className="badge-large">Google Play</span>
          </div>
        </div>
        <div className="store-badge app-store">
          <div className="badge-icon"></div>
          <div className="badge-text">
            <span className="badge-small">Download on the</span>
            <span className="badge-large">App Store</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDownload;
