import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { RecipeBook } from './RecipeBook';
import { gameService } from '../services';

interface DashboardProps {
  user: any;
  games: any[];
  loadGames: () => Promise<void>;
  setCurrentGameId: (id: string | null) => void;
  handleDeleteGame: (gameId: string) => Promise<void>;
  setShowCreateModal: (show: boolean) => void;
}

export function Dashboard({
  user,
  games,
  loadGames,
  setCurrentGameId,
  handleDeleteGame,
  setShowCreateModal
}: DashboardProps) {
  const [dashboardTab, setDashboardTab] = useState<'reactors' | 'recipes'>('reactors');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    setJoinSuccess('');
    if (!inviteCodeInput) return;

    try {
      const searchData = await gameService.listGames(inviteCodeInput.trim());
      const found = searchData.games?.find(
        (g: any) => g.inviteCode === inviteCodeInput.trim().toUpperCase() || g.id === inviteCodeInput.trim()
      );
      if (found) {
        const joinData = await gameService.joinGame(found.id);
        if (joinData.success) {
          setJoinSuccess('Request to join submitted! Awaiting host slot assignment.');
          setInviteCodeInput('');
          loadGames();
        } else {
          setJoinError('Failed to submit join request.');
        }
      } else {
        setJoinError('Crucible session not found.');
      }
    } catch (e) {
      setJoinError('Error connecting to backend.');
    }
  };

  return (
    <main className={`dashboard-layout tab-active-${dashboardTab}`}>
      {/* Mobile only Tab system */}
      <div className="mobile-tabs-container" style={{ gridColumn: 'span 4' }}>
        <button 
          onClick={() => setDashboardTab('reactors')} 
          className={`tab-btn ${dashboardTab === 'reactors' ? 'tab-btn-active' : ''}`}
        >
          Reactors
        </button>
        <button 
          onClick={() => setDashboardTab('recipes')} 
          className={`tab-btn ${dashboardTab === 'recipes' ? 'tab-btn-active' : ''}`}
        >
          Recipe Book
        </button>
      </div>

      <div className="main-panel tab-content-reactors">
        <div className="dashboard-title-section">
          <div>
            <h2 className="dashboard-title-heading">ACTIVE LABORATORIES</h2>
            <p className="dashboard-title-subtext">Select a reactor to synthesize items</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-sci-fi btn-sci-fi-gold">
            <Plus className="h-4 w-4" /> IGNITE NEW CRUCIBLE
          </button>
        </div>

        <div className="dashboard-grid-widgets">
          {/* Join Game Box */}
          <div className="glass-panel glass-panel-neon-purple" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 className="widget-title">CONNECT TO SESSION</h3>
              <p className="widget-subtitle">Enter a crucible code to submit credentials</p>
            </div>
            {joinError && <div className="auth-error-banner">ERROR: {joinError}</div>}
            {joinSuccess && (
              <div 
                className="notice-success" 
                style={{ 
                  padding: '8px', 
                  fontSize: '11px', 
                  fontFamily: 'Share Tech Mono', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  border: '1px solid rgba(16, 185, 129, 0.2)', 
                  borderRadius: '6px' 
                }}
              >
                SUCCESS: {joinSuccess}
              </div>
            )}
            <form onSubmit={handleJoinGame} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                required
                placeholder="CRUCIBLE CODE" 
                className="terminal-input"
                style={{ flex: 1, textTransform: 'uppercase' }}
                value={inviteCodeInput}
                onChange={e => setInviteCodeInput(e.target.value)}
              />
              <button type="submit" className="btn-sci-fi">JOIN</button>
            </form>
          </div>

          {/* Stats Box */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <h3 className="widget-title widget-title-muted">ALCHEMY ARCHIVES</h3>
              <p className="widget-subtitle">Telemetry results from current scientist</p>
            </div>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-label">Transmutations Run</div>
                <div className="stat-value">{user.stats?.gamesPlayed || 0}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Crucibles Won</div>
                <div className="stat-value stat-value-gold">{user.stats?.gamesWon || 0} Wins</div>
              </div>
            </div>
          </div>
        </div>

        {/* Games list */}
        <div className="glass-panel reactors-container">
          <h3 className="widget-title widget-title-muted" style={{ marginBottom: '16px' }}>ACTIVE REACTOR CORES</h3>
          {games.length === 0 ? (
            <div className="reactors-empty">
              <p className="reactors-empty-text">No active reactors detected. Ignite a new crucible above to begin.</p>
            </div>
          ) : (
            <div className="reactors-list">
              {games.map(game => {
                const host = game.ownerEmail || 'Unknown';
                const actPlayer = game.gameState.players?.[game.gameState.activePlayerIdx || 0];
                const isTurn = actPlayer?.assignedEmail === user.email;
                
                return (
                  <div key={game.id} className="reactor-row">
                    <div className="reactor-info">
                      <span className="reactor-name">{game.name || 'Unnamed Crucible'}</span>
                      <span className="reactor-details">HOST: {host} | Tiers Discovered: {game.gameState.discoveredPool?.length || 4}/33</span>
                    </div>
                    <div className="reactor-actions">
                      <span className="badge-code">
                        CODE: {game.inviteCode}
                      </span>
                      <span className={`badge-status ${isTurn && game.gameState.status === 'playing' ? 'badge-status-turn' : 'badge-status-wait'}`}>
                        {game.gameState.status === 'setup' ? 'PREPARING' : isTurn ? 'YOUR TURN' : 'WAITING'}
                      </span>
                      <button 
                        onClick={() => setCurrentGameId(game.id)}
                        className="btn-sci-fi"
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                      >
                        ENTER
                      </button>
                      {game.ownerEmail === user.email && (
                        <button 
                          onClick={() => handleDeleteGame(game.id)}
                          className="btn-sci-fi btn-danger"
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                        >
                          PURGE
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-panel tab-content-recipes">
        <RecipeBook />
      </div>
    </main>
  );
}
