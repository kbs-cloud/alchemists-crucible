import React from 'react';
import { Trophy } from 'lucide-react';
import { Player } from '../game/gameState';

interface LeaderboardProps {
  players: Player[];
  activePlayerIdx: number;
  connectedPlayers: string[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  players,
  activePlayerIdx,
  connectedPlayers
}) => {
  return (
    <div className="leaderboard-container">
      <h3 className="widget-title" style={{ borderBottom: '1px solid rgba(157, 78, 223, 0.15)', paddingBottom: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Trophy className="h-4 w-4" /> ALCHEMIST STANDINGS
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {players.map((p, idx) => {
          const isActive = activePlayerIdx === idx;
          const isConnected = p.isAi || p.isLocal || connectedPlayers.includes(p.assignedEmail || '');
          
          return (
            <div 
              key={p.id} 
              className={`player-row ${isActive ? 'player-row-active' : ''}`}
            >
              <div className="player-meta">
                <div className={`status-dot ${isConnected ? 'status-dot-online' : 'status-dot-offline'}`} />
                <span className={isActive ? 'player-name-active' : 'player-name'}>
                  {p.name} {p.isAi ? '🤖' : ''}
                </span>
              </div>
              <span className="player-score">{p.score} pts</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
