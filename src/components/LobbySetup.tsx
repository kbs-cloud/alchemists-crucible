import React from 'react';
import { Bot } from 'lucide-react';
import { Player } from '../game/gameState';

interface LobbySetupProps {
  currentGameId: string;
  players: Player[];
  joinRequests: any[];
  userEmail: string;
  hostEmail: string;
  isVacant: (player: Player) => boolean;
  onAssignSlot: (playerId: string, assignOptions: { email?: string | null, isAi?: boolean, isLocal?: boolean, name?: string }) => void;
  onRejectJoin: (requestId: number) => void;
  onStartGame: () => void;
}

export const LobbySetup: React.FC<LobbySetupProps> = ({
  currentGameId,
  players,
  joinRequests,
  userEmail,
  hostEmail,
  isVacant,
  onAssignSlot,
  onRejectJoin,
  onStartGame
}) => {
  const isHost = userEmail && hostEmail === userEmail;

  return (
    <div className="glass-panel glass-panel-neon-purple lobby-setup-container">
      <div>
        <h2 className="lobby-title-heading">REACTOR CHAMBER PREPARATION</h2>
        <p className="lobby-invite-code">Invite code: <span className="lobby-invite-badge">{currentGameId.substring(0, 6).toUpperCase()}</span></p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0, overflowY: 'auto', paddingRight: '4px' }} className="scrollbar">
        <h3 className="widget-title">APPRENTICE SLOTS</h3>
        <div className="lobby-slots-list">
          {players.map((p, idx) => {
            const isPlayerHost = idx === 0;
            return (
              <div key={p.id} className="slot-row">
                <div className="slot-row-meta">
                  <div className={`slot-row-dot ${p.assignedEmail || p.isAi || p.isLocal ? 'slot-row-dot-active' : 'slot-row-dot-empty'}`} />
                  <span className="slot-row-name">{p.name}</span>
                  {isPlayerHost && <span className="slot-row-badge-host">HOST</span>}
                </div>

                <div className="slot-row-actions">
                  {p.assignedEmail && <span className="slot-row-email">{p.assignedEmail}</span>}
                  {!p.assignedEmail && !p.isAi && (
                    <>
                      <button 
                        disabled={!isHost}
                        onClick={() => onAssignSlot(p.id, { isAi: true, name: 'AI Apprentice' })}
                        className="btn-sci-fi"
                        style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', gap: '4px', alignItems: 'center' }}
                      >
                        <Bot className="h-3.5 w-3.5" /> ADD AI
                      </button>
                      <button 
                        disabled={!isHost}
                        onClick={() => onAssignSlot(p.id, { isLocal: true, name: `Apprentice ${idx + 1}` })}
                        className="btn-sci-fi"
                        style={{ padding: '6px 12px', fontSize: '11px' }}
                      >
                        SET LOCAL
                      </button>
                    </>
                  )}
                  {(p.assignedEmail || p.isAi) && !isPlayerHost && (
                    <button 
                      disabled={!isHost}
                      onClick={() => onAssignSlot(p.id, { email: null, isAi: false, isLocal: true })}
                      className="btn-sci-fi btn-danger"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                    >
                      CLEAR SLOT
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pending Join Requests */}
        {joinRequests.length > 0 && (
          <div className="join-requests-section">
            <h4 className="join-requests-title">PENDING CONNECTION REQUESTS</h4>
            <div className="join-requests-list">
              {joinRequests.map(req => (
                <div key={req.id} className="join-request-row">
                  <span>{req.displayName} ({req.email})</span>
                  <div className="join-request-actions">
                    {isHost && players.some(p => isVacant(p)) && (
                      <button 
                        onClick={() => {
                          const vacantSlot = players.find(p => isVacant(p));
                          if (vacantSlot) {
                            onAssignSlot(vacantSlot.id, { email: req.email, name: req.displayName });
                          }
                        }}
                        className="btn-sci-fi"
                        style={{ padding: '4px 10px', fontSize: '11px' }}
                      >
                        APPROVE
                      </button>
                    )}
                    <button 
                      disabled={!isHost}
                      onClick={() => onRejectJoin(req.id)}
                      className="btn-sci-fi btn-danger"
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                    >
                      REJECT
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isHost && (
        <button 
          onClick={onStartGame}
          className="btn-sci-fi btn-sci-fi-gold"
          style={{ padding: '12px 24px', fontSize: '15px', width: '100%', marginTop: 'auto' }}
        >
          🔥 IGNITE THE CRUCIBLE
        </button>
      )}
    </div>
  );
};
