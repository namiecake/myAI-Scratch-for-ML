import React, { useState } from 'react';
import { IoInformationCircleOutline } from "react-icons/io5";

interface InfoButtonProps {
  content: React.ReactNode;
}

export const InfoButton: React.FC<InfoButtonProps> = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <div className="info-button-container">
        <button 
          className="info-button"
          onClick={() => setIsVisible(true)}
          aria-label="Information"
        >
          <IoInformationCircleOutline />
        </button>
      </div>

      {isVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-text">
              {content}
            </div>
            <button 
              className="modal-close-button"
              onClick={() => setIsVisible(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}; 