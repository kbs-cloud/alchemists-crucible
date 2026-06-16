import React from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { ELEMENTS } from '../game/gameState';
import { ELEMENT_EMOJIS } from '../services/api';

interface CauldronProps {
  selectedElements: string[];
  gameActionError: string;
  transmuteSuccess: string | null;
  turnCount: number;
  maxTicks: number;
  discoveredCount: number;
  activePlayerName: string;
  isMyTurn: boolean;
  handleTransmute: () => void;
  handleReset: () => void;
  handleEndTurn: () => void;
}

export const Cauldron: React.FC<CauldronProps> = ({
  selectedElements,
  gameActionError,
  transmuteSuccess,
  turnCount,
  maxTicks,
  discoveredCount,
  activePlayerName,
  isMyTurn,
  handleTransmute,
  handleReset,
  handleEndTurn
}) => {
  return (
    <div className="glass-panel cauldron-panel">
      
      {/* Dashboard Status meters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontFamily: 'Share Tech Mono', fontSize: '11px', color: 'var(--text-muted)' }}>
        <span>TURN: <strong style={{ color: 'white' }}>{turnCount}</strong> / {maxTicks}</span>
        <span>DISCOVERED: <strong style={{ color: 'white' }}>{discoveredCount}</strong> / 33</span>
      </div>

      {/* Cauldron Center Area */}
      <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
        <div className="cauldron-container">
          <div className="cauldron-glow" />
          <div className="liquid-bubble" style={{ left: '40px', bottom: '20px', width: '8px', height: '8px', animationDelay: '0.5s' }} />
          <div className="liquid-bubble" style={{ left: '80px', bottom: '30px', width: '12px', height: '12px', animationDelay: '1.5s' }} />
          <div className="liquid-bubble" style={{ left: '120px', bottom: '25px', width: '6px', height: '6px', animationDelay: '0s' }} />
          
          {/* Float Selected elements inside Cauldron */}
          <div className="cauldron-slots">
            {selectedElements.length === 0 ? (
              <div className="cauldron-slots-empty">
                Place 2 cards below in crucible
              </div>
            ) : (
              selectedElements.map((elId, index) => {
                const el = ELEMENTS[elId];
                return (
                  <div 
                    key={`${elId}_selected_${index}`} 
                    className="cauldron-selected-card"
                    style={{ 
                      borderColor: el.color, 
                      color: el.color,
                      boxShadow: `0 0 12px ${el.color}66`,
                      animationDelay: `${index * 0.5}s` 
                    }}
                  >
                    <span className="cauldron-selected-emoji">{ELEMENT_EMOJIS[elId]}</span>
                    <span className="cauldron-selected-name">{el.name}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Error and Success notices */}
        <div className="status-notices">
          {gameActionError && <div className="notice-error"><AlertCircle className="h-4 w-4" /> {gameActionError}</div>}
          {transmuteSuccess && <div className="notice-success"><Sparkles className="h-4 w-4" /> {transmuteSuccess}</div>}
        </div>

        {/* Action buttons */}
        <div className="cauldron-controls">
          <button 
            disabled={selectedElements.length !== 2}
            onClick={handleTransmute}
            className="btn-sci-fi btn-sci-fi-gold"
            style={{ padding: '10px 24px' }}
          >
            <Sparkles className="h-4 w-4" /> TRANSMUTE
          </button>
          <button 
            onClick={handleReset}
            className="btn-sci-fi btn-danger"
            style={{ padding: '10px 18px' }}
          >
            RESET
          </button>
        </div>
      </div>

      {/* Turn end indicator */}
      <div className="cauldron-footer">
        <div className="footer-player-turn">
          ACTIVE ALCHEMIST: <span className="footer-player-name">{activePlayerName.toUpperCase()}</span>
        </div>
        {isMyTurn && (
          <button 
            onClick={handleEndTurn}
            className="btn-sci-fi"
            style={{ padding: '6px 16px', fontSize: '11px' }}
          >
            SKIP TURN
          </button>
        )}
      </div>
    </div>
  );
};
