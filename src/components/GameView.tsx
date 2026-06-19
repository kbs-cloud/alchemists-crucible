import React, { useState } from 'react';
import { Trophy, History, RefreshCw } from 'lucide-react';
import { ELEMENTS, GameState, isPlayerVacant } from '../game/gameState';
import { apiFetch } from '../services/api';
import { gameService } from '../services';

// Components
import { LobbySetup } from './LobbySetup';
import { Cauldron } from './Cauldron';
import { ElementCard } from './ElementCard';
import { Leaderboard } from './Leaderboard';
import { RecipeBook } from './RecipeBook';

interface GameViewProps {
  currentGame: GameState | null;
  currentGameId: string;
  user: any;
  connectedPlayers: string[];
  joinRequests: any[];
  muted: boolean;
  pollGame: () => Promise<void>;
  setCurrentGame: (state: GameState | null) => void;
  setCurrentGameId: (id: string | null) => void;
  loadGames: () => Promise<void>;
  handleAssignSlot: (playerId: string, assignOptions: any) => Promise<void>;
  handleStartGame: () => void;
}

export function GameView({
  currentGame,
  currentGameId,
  user,
  connectedPlayers,
  joinRequests,
  muted,
  pollGame,
  setCurrentGame,
  setCurrentGameId,
  loadGames,
  handleAssignSlot,
  handleStartGame
}: GameViewProps) {
  const [activeTab, setActiveTab] = useState<'crucible' | 'deck' | 'scoreboard' | 'recipes'>('crucible');
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [gameActionError, setGameActionError] = useState('');
  const [transmuteSuccess, setTransmuteSuccess] = useState<string | null>(null);

  const mySlot = currentGame?.players.find(
    p => p.assignedEmail === user?.email || (user?.email === 'apprentice@local' && p.id === 'player_1')
  );
  const activePlayer = currentGame ? currentGame.players[currentGame.activePlayerIdx] : null;
  const isMyTurn = activePlayer && mySlot && activePlayer.id === mySlot.id;

  const handleTransmute = async () => {
    if (!currentGameId || !currentGame) return;
    setGameActionError('');
    setTransmuteSuccess(null);

    const activePlayerObj = currentGame.players[currentGame.activePlayerIdx];
    const mySlotObj = currentGame.players.find(
      p => p.assignedEmail === user?.email || (user?.email === 'apprentice@local' && p.id === 'player_1')
    );

    if (!mySlotObj) {
      setGameActionError('You are not assigned to a slot in this session.');
      return;
    }

    if (activePlayerObj.id !== mySlotObj.id) {
      setGameActionError('It is not your turn.');
      return;
    }

    if (selectedElements.length !== 2) {
      setGameActionError('Select exactly 2 elements to throw into the crucible.');
      return;
    }

    try {
      const data = await gameService.performGameAction(
        currentGameId,
        {
          type: 'combine',
          element1: selectedElements[0],
          element2: selectedElements[1]
        },
        mySlotObj.id
      );

      if (data.success) {
        const nextState = data.gameState;
        
        // Find if recipe exists in output history compared to previous pool
        const addedNew = nextState.discoveredPool.length > currentGame.discoveredPool.length;
        
        setCurrentGame(nextState);
        setSelectedElements([]);
        
        if (addedNew) {
          const newlyDiscovered = nextState.discoveredPool[nextState.discoveredPool.length - 1];
          setTransmuteSuccess(`Success! Synthesized: ${ELEMENTS[newlyDiscovered]?.name}`);
          
          if (!muted && typeof AudioContext !== 'undefined') {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(587.33, ctx.currentTime);
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
          }
        } else {
          setGameActionError('The elements reacted violently but dissolved into formless steam.');
          if (!muted && typeof AudioContext !== 'undefined') {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
          }
        }
      } else {
        setGameActionError(data.error || 'Failed to combine elements.');
      }
    } catch (e) {
      setGameActionError('Connection error.');
    }
  };

  const handleEndTurn = async () => {
    if (!currentGameId || !currentGame) return;
    const mySlotObj = currentGame.players.find(
      p => p.assignedEmail === user?.email || (user?.email === 'apprentice@local' && p.id === 'player_1')
    );
    if (!mySlotObj) return;

    try {
      const data = await gameService.performGameAction(currentGameId, { type: 'end_turn' }, mySlotObj.id);
      if (data.success) {
        await pollGame();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCardClick = (elementId: string) => {
    if (selectedElements.includes(elementId)) {
      setSelectedElements(selectedElements.filter(id => id !== elementId));
    } else {
      if (selectedElements.length < 2) {
        setSelectedElements([...selectedElements, elementId]);
      } else {
        setSelectedElements([selectedElements[1], elementId]);
      }
    }
  };

  return (
    <main className={`game-layout tab-active-${activeTab}`}>
      {currentGame ? (
        <>
          {/* Mobile Tab system */}
          <div className="mobile-tabs-container" style={{ gridColumn: 'span 4' }}>
            <button 
              onClick={() => setActiveTab('crucible')} 
              className={`tab-btn ${activeTab === 'crucible' ? 'tab-btn-active' : ''}`}
            >
              Crucible
            </button>
            <button 
              onClick={() => setActiveTab('deck')} 
              className={`tab-btn ${activeTab === 'deck' ? 'tab-btn-active' : ''}`}
            >
              My Deck
            </button>
            <button 
              onClick={() => setActiveTab('scoreboard')} 
              className={`tab-btn ${activeTab === 'scoreboard' ? 'tab-btn-active' : ''}`}
            >
              Standings & Log
            </button>
            <button 
              onClick={() => setActiveTab('recipes')} 
              className={`tab-btn ${activeTab === 'recipes' ? 'tab-btn-active' : ''}`}
            >
              Recipe Book
            </button>
          </div>

          <div className="main-panel tab-content-crucible">
            {/* Setup State */}
            {currentGame.status === 'setup' && (
              <LobbySetup 
                currentGameId={currentGameId}
                players={currentGame.players}
                joinRequests={joinRequests}
                userEmail={user.email}
                hostEmail={currentGame.players[0]?.assignedEmail || ''}
                isVacant={(p) => isPlayerVacant(p, currentGame.status)}
                onAssignSlot={handleAssignSlot}
                onRejectJoin={(reqId) => {
                  apiFetch(`/api/games/${currentGameId}/reject-join`, {
                    method: 'POST',
                    body: JSON.stringify({ joinRequestId: reqId })
                  }).then(pollGame);
                }}
                onStartGame={handleStartGame}
              />
            )}

            {/* Playing State */}
            {currentGame.status === 'playing' && (
              <>
                <div className="cauldron-tab-section">
                  <Cauldron 
                    selectedElements={selectedElements}
                    gameActionError={gameActionError}
                    transmuteSuccess={transmuteSuccess}
                    turnCount={currentGame.turnCount}
                    maxTicks={currentGame.maxTicks}
                    discoveredCount={currentGame.discoveredPool?.length || 4}
                    activePlayerName={activePlayer ? activePlayer.name : ''}
                    isMyTurn={!!isMyTurn}
                    handleTransmute={handleTransmute}
                    handleReset={() => setSelectedElements([])}
                    handleEndTurn={handleEndTurn}
                  />
                </div>

                {/* Card Deck Hand */}
                <div className="deck-tab-section">
                  <div className="glass-panel deck-container">
                    <h3 className="deck-header">
                      <span>YOUR DECK INVENTORY</span>
                      <span className="deck-header-highlight">SELECT {selectedElements.length}/2 CARDS</span>
                    </h3>
                    <div className="deck-scroll-wrapper scrollbar">
                      {mySlot?.inventory.map(elId => (
                        <ElementCard 
                          key={elId}
                          elementId={elId}
                          element={ELEMENTS[elId]}
                          isSelected={selectedElements.includes(elId)}
                          onClick={() => handleCardClick(elId)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Completed State */}
            {currentGame.status === 'completed' && (
              <div 
                className="glass-panel" 
                style={{ 
                  textAlign: 'center', 
                  padding: '40px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '24px' 
                }}
              >
                <Trophy className="h-20 w-20 text-[#ffb703] animate-bounce" />
                <h2 className="lobby-title-heading" style={{ fontSize: '28px' }}>CRUCIBLE COLLAPSED</h2>
                <p className="recipe-book-desc" style={{ maxWidth: '400px' }}>
                  The transmutation sequence has reached final completion. Leaderboard values have been updated.
                </p>

                <div 
                  className="glass-panel" 
                  style={{ 
                    width: '100%', 
                    maxWidth: '400px', 
                    padding: '16px', 
                    background: 'rgba(0,0,0,0.4)', 
                    border: '1px solid rgba(157,78,223,0.1)' 
                  }}
                >
                  <h3 className="widget-title" style={{ textAlign: 'left', marginBottom: '12px' }}>FINAL STANDINGS</h3>
                  {[...currentGame.players].sort((a,b) => b.score - a.score).map((p, idx) => (
                    <div 
                      key={p.id} 
                      className="player-row" 
                      style={{ 
                        border: 'none', 
                        background: 'none', 
                        borderBottom: '1px solid rgba(255,255,255,0.05)', 
                        borderRadius: '0' 
                      }}
                    >
                      <span style={{ color: 'white' }}>{idx+1}. {p.name} {p.isAi ? '(AI)' : ''}</span>
                      <span className="player-score">{p.score} pts</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => { 
                    setCurrentGameId(null); 
                    setCurrentGame(null); 
                    loadGames(); 
                  }}
                  className="btn-sci-fi btn-sci-fi-gold"
                  style={{ padding: '12px 32px' }}
                >
                  RETURN TO LABORATORY
                </button>
              </div>
            )}
          </div>

          {/* Scoreboard & Lab Log Panel */}
          <div className="sidebar-panel tab-content-scoreboard">
            <div 
              className="glass-panel" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '24px', 
                height: '100%', 
                minHeight: 0, 
                overflow: 'hidden' 
              }}
            >
              <Leaderboard 
                players={currentGame.players}
                activePlayerIdx={currentGame.activePlayerIdx}
                connectedPlayers={connectedPlayers}
              />

              <div className="logs-container">
                <h3 
                  className="widget-title widget-title-muted" 
                  style={{ 
                    borderBottom: '1px solid rgba(157,78,223,0.15)', 
                    paddingBottom: '8px', 
                    marginBottom: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px' 
                  }}
                >
                  <History className="h-4 w-4" /> LABORATORY LOG
                </h3>
                <div className="logs-list scrollbar">
                  {currentGame.history?.slice().reverse().map((log, index) => (
                    <div key={index} className="log-row">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Tab Recipe Book Panel */}
          <div className="sidebar-panel tab-content-recipes">
            <RecipeBook />
          </div>
        </>
      ) : (
        <div className="loader-overlay" style={{ gridColumn: 'span 4' }}>
          <div className="loader-container">
            <RefreshCw className="loader-icon spin-loader" />
            <div className="loader-text">RETRIEVING REACTOR LOGS...</div>
          </div>
        </div>
      )}
    </main>
  );
}
