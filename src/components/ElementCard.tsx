import React from 'react';
import { ElementDef } from '../game/gameState';
import { ELEMENT_EMOJIS } from '../services/api';

interface ElementCardProps {
  elementId: string;
  element: ElementDef;
  isSelected: boolean;
  onClick: () => void;
}

export const ElementCard: React.FC<ElementCardProps> = ({
  elementId,
  element,
  isSelected,
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className={`element-card ${isSelected ? 'selected' : ''}`}
      style={{ 
        borderColor: isSelected ? element.color : 'rgba(255, 255, 255, 0.08)',
        color: element.color,
        boxShadow: isSelected ? `0 0 15px ${element.color}` : 'none'
      }}
    >
      <span className="card-tier">TIER {element.tier}</span>
      <span className="card-icon">{ELEMENT_EMOJIS[elementId] || '❓'}</span>
      <span className="card-name" style={{ color: isSelected ? element.color : 'white' }}>{element.name}</span>
    </div>
  );
};
