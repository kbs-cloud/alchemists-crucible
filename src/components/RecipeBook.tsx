import React from 'react';
import { ELEMENTS } from '../game/gameState';
import { ELEMENT_EMOJIS } from '../services/api';

export const RecipeBook: React.FC = () => {
  return (
    <div className="glass-panel recipe-book-container">
      <h3 className="widget-title" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid rgba(157, 78, 223, 0.15)', paddingBottom: '8px', marginBottom: '4px' }}>
        ELEMENT RECIPES BOOK
      </h3>
      <p className="recipe-book-desc">
        Discover cards to build your library. Core elements are unlocked by default.
      </p>
      <div className="recipes-list scrollbar">
        {Object.values(ELEMENTS).map(el => (
          <div key={el.id} className="recipe-item-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px' }}>{ELEMENT_EMOJIS[el.id] || '❓'}</span>
              <span className="recipe-item-name">{el.name}</span>
            </div>
            <span className="recipe-item-meta">Tier {el.tier}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
