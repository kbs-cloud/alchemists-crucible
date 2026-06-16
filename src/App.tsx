import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  User, 
  LogOut, 
  Plus, 
  Volume2, 
  VolumeX, 
  RefreshCw,
  Trophy,
  History,
  Globe,
  Menu,
  X
} from 'lucide-react';
import { ELEMENTS, GameState, isPlayerVacant } from './game/gameState';
import { apiFetch, isOnlineMode } from './services/api';
import { authService, gameService } from './services';

// Subcomponents
import { AuthScreen } from './components/AuthScreen';
import { CreateLobbyModal } from './components/CreateLobbyModal';
import { RecipeBook } from './components/RecipeBook';
import { Cauldron } from './components/Cauldron';
import { ElementCard } from './components/ElementCard';
import { Leaderboard } from './components/Leaderboard';
import { LobbySetup } from './components/LobbySetup';

export default function App() {
  const [playOnline, setPlayOnline] = useState<boolean>(() => localStorage.getItem('alchemist_play_online') !== 'false');
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isGooglePolling, setIsGooglePolling] = useState(false);
  const [loaderText, setLoaderText] = useState('IGNITING THE LAB FURNACE...');
  const ssoCheckedRef = useRef(false);

  const [muted, setMuted] = useState(true);

  // Mobile navigation tabs & menu states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'crucible' | 'deck' | 'scoreboard' | 'recipes'>('crucible');
  const [dashboardTab, setDashboardTab] = useState<'reactors' | 'recipes'>('reactors');

  // Dashboard state
  const [games, setGames] = useState<any[]>([]);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createGameName, setCreateGameName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(3);
  const [maxTicks, setMaxTicks] = useState(25);

  // Active Game State
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [currentGame, setCurrentGame] = useState<GameState | null>(null);
  const [connectedPlayers, setConnectedPlayers] = useState<string[]>([]);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [gameActionError, setGameActionError] = useState('');
  const [transmuteSuccess, setTransmuteSuccess] = useState<string | null>(null);

  // Lobby lists
  const [joinRequests, setJoinRequests] = useState<any[]>([]);

  // Polling ref
  const pollIntervalRef = useRef<any>(null);
  const stateRef = useRef({ currentGameId, user });

  useEffect(() => {
    stateRef.current = { currentGameId, user };
  }, [currentGameId, user]);

  // Init CSRF
  useEffect(() => {
    localStorage.removeItem('alchemist_auth_pending_token');
    authService.initCSRF();
  }, []);

  // Connection mode / session sync
  useEffect(() => {
    setAuthLoading(true);
    setCurrentGameId(null);
    setCurrentGame(null);
    setLoaderText('IGNITING THE LAB FURNACE...');
    localStorage.setItem('alchemist_play_online', playOnline ? 'true' : 'false');

    let active = true;

    authService.checkSession().then(async (u) => {
      if (!active) return;
      if (u) {
        setUser(u);
        setAuthLoading(false);
        loadGames();
      } else {
        setGames([]);
        
        if (playOnline && !ssoCheckedRef.current) {
          ssoCheckedRef.current = true;
          setLoaderText('CONNECTING TO CENTRAL SSO DIRECTORY...');
          
          const isPackaged = typeof window !== 'undefined' && 
                             (window.location.protocol === 'file:' || 
                              navigator.userAgent.toLowerCase().includes('electron'));
          if (isPackaged) {
            setAuthLoading(false);
            return;
          }

          const localBackend = window.location.origin;
          const redirectUri = `${localBackend}/api/auth/callback?source=iframe`;
          
          const getAuthServer = () => {
            if (import.meta.env.VITE_AUTH_SERVER_URL) {
              return import.meta.env.VITE_AUTH_SERVER_URL;
            }
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
              const port = window.location.port;
              if (port === '28004' || port === '29004') {
                return 'http://localhost:28001';
              }
            }
            return `${window.location.protocol}//auth.kbs-cloud.com`;
          };

          const authorizeUrl = `${getAuthServer()}/api/auth/authorize?client_id=alchemist&redirect_uri=${encodeURIComponent(redirectUri)}`;
          
          const iframe = document.createElement('iframe');
          iframe.src = authorizeUrl;
          iframe.style.display = 'none';
          document.body.appendChild(iframe);

          let cleanedUp = false;
          
          const cleanup = () => {
            if (cleanedUp) return;
            cleanedUp = true;
            window.removeEventListener('message', handleMessage);
            if (iframe.parentNode) {
              iframe.parentNode.removeChild(iframe);
            }
          };

          const timeoutId = setTimeout(() => {
            if (!active) return;
            cleanup();
            setAuthLoading(false);
            
            const params = new URLSearchParams(window.location.search);
            const error = params.get('error');
            if (error) {
              setAuthError(error === 'session_fail' ? 'Session establishment failed.' : error);
              window.history.replaceState(null, '', window.location.pathname);
            }
          }, 3000);

          const handleMessage = async (event: MessageEvent) => {
            if (!active) return;
            if (event.origin !== window.location.origin) return;
            if (event.data && event.data.type === 'SSO_LOGIN_SUCCESS') {
              clearTimeout(timeoutId);
              cleanup();
              try {
                const uData = await authService.checkSession();
                if (uData && active) {
                  setUser(uData);
                  loadGames();
                }
              } catch (e) {
                console.error(e);
              } finally {
                if (active) {
                  setAuthLoading(false);
                }
              }
            }
          };

          window.addEventListener('message', handleMessage);
        } else {
          setAuthLoading(false);
          const params = new URLSearchParams(window.location.search);
          const error = params.get('error');
          if (error) {
            setAuthError(error === 'session_fail' ? 'Session establishment failed.' : error);
            window.history.replaceState(null, '', window.location.pathname);
          }
        }
      }
    }).catch(() => {
      if (!active) return;
      setUser(null);
      setAuthLoading(false);
      setGames([]);
    });

    return () => {
      active = false;
      ssoCheckedRef.current = false;
    };
  }, [playOnline]);

  // Poll for Google login status
  useEffect(() => {
    let active = true;
    let pollInterval: any = null;

    const startPolling = (token: string) => {
      setIsGooglePolling(true);
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = setInterval(async () => {
        if (!active) return;
        try {
          const data = await authService.pollAuth(token);
          if (data.status === 'success' && data.sessionId) {
            clearInterval(pollInterval);
            localStorage.removeItem('alchemist_auth_pending_token');
            setIsGooglePolling(false);
            localStorage.setItem('alchemist_session_id', data.sessionId);
            
            const userData = await authService.checkSession();
            if (userData) {
              setUser(userData);
              loadGames();
            }
          } else if (data.status === 'error') {
            clearInterval(pollInterval);
            localStorage.removeItem('alchemist_auth_pending_token');
            setIsGooglePolling(false);
            setAuthError(data.error || 'Google Authentication failed.');
          }
        } catch (e) {
          console.error(e);
        }
      }, 2000);
    };

    const checkToken = () => {
      const token = localStorage.getItem('alchemist_auth_pending_token');
      if (token) {
        startPolling(token);
      }
    };

    const tokenInterval = setInterval(checkToken, 1000);
    return () => {
      active = false;
      if (pollInterval) clearInterval(pollInterval);
      clearInterval(tokenInterval);
    };
  }, []);

  // Poll game simulation loop
  useEffect(() => {
    if (currentGameId) {
      pollGame();
      pollIntervalRef.current = setInterval(pollGame, 3000);
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [currentGameId]);

  const loadGames = async () => {
    try {
      const data = await gameService.listGames();
      if (data.success) {
        setGames(data.games || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pollGame = async () => {
    const { currentGameId: activeId } = stateRef.current;
    if (!activeId) return;
    try {
      const data = await gameService.getGame(activeId);
      if (data.success) {
        setCurrentGame(data.game.gameState);
        setConnectedPlayers(data.connectedPlayers || []);
        if (data.game.gameState.status === 'setup') {
          const reqData = await gameService.fetchJoinRequests(activeId);
          if (reqData.success) {
            setJoinRequests(reqData.requests || []);
          }
        }
      } else {
        setCurrentGameId(null);
        setCurrentGame(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await authService.logoutUser();
    setUser(null);
    setCurrentGameId(null);
    setCurrentGame(null);
    localStorage.removeItem('alchemist_session_id');

    const isPackaged = typeof window !== 'undefined' && 
                       (window.location.protocol === 'file:' || 
                        navigator.userAgent.toLowerCase().includes('electron'));
    if (!isPackaged && playOnline) {
      const getAuthUrl = () => {
        if (import.meta.env.VITE_AUTH_SERVER_URL) {
          return import.meta.env.VITE_AUTH_SERVER_URL;
        }
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          return 'http://localhost:28001';
        }
        return `${window.location.protocol}//auth.kbs-cloud.com`;
      };
      window.location.href = `${getAuthUrl()}/api/auth/logout?redirect_uri=${encodeURIComponent(window.location.origin)}`;
    }
  };
 
  const redirectToAuth = () => {
    const isPackaged = typeof window !== 'undefined' && 
                       (window.location.protocol === 'file:' || 
                        navigator.userAgent.toLowerCase().includes('electron'));
    
    const localBackend = isPackaged ? 'http://localhost:29004' : window.location.origin;
    const redirectUri = `${localBackend}/api/auth/callback`;
 
    const getAuthServer = () => {
      if (import.meta.env.VITE_AUTH_SERVER_URL) {
        return import.meta.env.VITE_AUTH_SERVER_URL;
      }
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const port = window.location.port;
        if (port === '28004' || port === '29004') {
          return 'http://localhost:28001';
        }
      }
      return `${window.location.protocol}//auth.kbs-cloud.com`;
    };

    let authorizeUrl = `${getAuthServer()}/api/auth/authorize?client_id=alchemist&redirect_uri=${encodeURIComponent(redirectUri)}`;

    if (isPackaged) {
      const token = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('alchemist_auth_pending_token', token);
      authorizeUrl += `&state=${encodeURIComponent(`source=electron&token=${token}`)}`;
      window.open(authorizeUrl, '_blank');
      setIsGooglePolling(true);
    } else {
      window.location.href = authorizeUrl;
    }
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createGameName) return;
    try {
      const data = await gameService.createGame(createGameName, maxPlayers, maxTicks);
      if (data.success) {
        setShowCreateModal(false);
        setCreateGameName('');
        setCurrentGameId(data.gameId);
        loadGames();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    setJoinSuccess('');
    if (!inviteCodeInput) return;

    try {
      const searchData = await gameService.listGames(inviteCodeInput.trim());
      const found = searchData.games?.find((g: any) => g.inviteCode === inviteCodeInput.trim().toUpperCase() || g.id === inviteCodeInput.trim());
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

  const handleAssignSlot = async (playerId: string, assignOptions: { email?: string | null, isAi?: boolean, isLocal?: boolean, name?: string }) => {
    if (!currentGameId) return;
    try {
      await gameService.assignSlot(currentGameId, playerId, assignOptions);
      pollGame();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartGame = () => {
    if (!currentGameId) return;
    gameService.performGameAction(currentGameId, { type: 'start' }, 'player_1')
      .then(pollGame)
      .catch(console.error);
  };

  const handleTransmute = async () => {
    if (!currentGameId || !currentGame) return;
    setGameActionError('');
    setTransmuteSuccess(null);

    const activePlayer = currentGame.players[currentGame.activePlayerIdx];
    const mySlot = currentGame.players.find(p => p.assignedEmail === user?.email || (user?.email === 'apprentice@local' && p.id === 'player_1'));

    if (!mySlot) {
      setGameActionError('You are not assigned to a slot in this session.');
      return;
    }

    if (activePlayer.id !== mySlot.id) {
      setGameActionError('It is not your turn.');
      return;
    }

    if (selectedElements.length !== 2) {
      setGameActionError('Select exactly 2 elements to throw into the crucible.');
      return;
    }

    try {
      const data = await gameService.performGameAction(currentGameId, {
        type: 'combine',
        element1: selectedElements[0],
        element2: selectedElements[1]
      }, mySlot.id);

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
    const mySlot = currentGame.players.find(p => p.assignedEmail === user?.email || (user?.email === 'apprentice@local' && p.id === 'player_1'));
    if (!mySlot) return;

    try {
      const data = await gameService.performGameAction(currentGameId, { type: 'end_turn' }, mySlot.id);
      if (data.success) {
        pollGame();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (confirm('Decommission this crucible? All alchemical records will be purged.')) {
      try {
        const data = await gameService.deleteGame(gameId);
        if (data.success) {
          loadGames();
        }
      } catch (e) {
        console.error(e);
      }
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

  if (authLoading) {
    return (
      <div className="loader-overlay">
        <div className="loader-container">
          <RefreshCw className="loader-icon spin-loader" />
          <div className="loader-text">{loaderText}</div>
        </div>
      </div>
    );
  }

  if (isGooglePolling) {
    return (
      <div className="auth-container">
        <div className="lab-grid" />
        <div className="glass-panel glass-panel-neon-purple auth-card">
          <div className="auth-header">
            <h2 className="auth-title">ESTABLISHING LINK</h2>
            <p className="auth-subtitle">Trans-Node Authorization</p>
          </div>
          <p className="auth-desc">
            Please log in using your external web browser window.
          </p>
          <div className="loader-icon spin-loader" style={{ margin: '0 auto 24px auto' }} />
          <button 
            onClick={() => {
              localStorage.removeItem('alchemist_auth_pending_token');
              setIsGooglePolling(false);
            }}
            className="btn-sci-fi btn-danger auth-btn-login"
          >
            Cancel Authentication Request
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen authError={authError} redirectToAuth={redirectToAuth} playOnline={playOnline} setPlayOnline={setPlayOnline} />;
  }

  const mySlot = currentGame?.players.find(p => p.assignedEmail === user?.email || (user?.email === 'apprentice@local' && p.id === 'player_1'));
  const activePlayer = currentGame ? currentGame.players[currentGame.activePlayerIdx] : null;
  const isMyTurn = activePlayer && mySlot && activePlayer.id === mySlot.id;

  return (
    <div className="app-container">
      <div className="lab-grid" />

      {/* Header bar */}
      <header className="header-bar">
        <div className="header-logo">
          <Flame className="header-logo-icon" />
          <span className="header-title">
            ALCHEMIST'S <span className="header-title-gold">CRUCIBLE</span>
          </span>
        </div>
        
        {/* Desktop Header Actions */}
        <div className="header-actions">
          <div className="header-action-group">
            <Globe className={`h-4 w-4 ${playOnline ? 'connection-badge-pulse' : 'text-gray-500'}`} />
            <select
              value={playOnline ? 'online' : 'offline'}
              onChange={e => setPlayOnline(e.target.value === 'online')}
              className="connection-selector"
            >
              <option value="online">ONLINE</option>
              <option value="offline">OFFLINE</option>
            </select>
          </div>
          {currentGameId && (
            <button 
              onClick={() => { setCurrentGameId(null); setCurrentGame(null); loadGames(); }}
              className="header-btn-back"
            >
              ← RETURN TO LAB
            </button>
          )}

          <button
            onClick={() => setMuted(!muted)}
            className="header-btn-mute"
            title={muted ? 'Unmute alerts' : 'Mute alerts'}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <div className="header-user-section">
            <User className="header-user-icon" />
            <span className="header-user-name">{user.displayName || user.email.split('@')[0]}</span>
          </div>

          <button onClick={handleLogout} className="header-btn-disconnect">
            <LogOut className="h-4 w-4" /> DISCONNECT
          </button>
        </div>

        {/* Mobile Hamburger Drawer Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="header-drawer-toggle"
          title="Toggle settings menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Mobile Settings Drawer Menu */}
        {mobileMenuOpen && (
          <div className="header-mobile-drawer">
            <div className="mobile-drawer-row">
              <span>MATRIX CONNECTION:</span>
              <select
                value={playOnline ? 'online' : 'offline'}
                onChange={e => {
                  setPlayOnline(e.target.value === 'online');
                  setMobileMenuOpen(false);
                }}
                className="connection-selector"
              >
                <option value="online">ONLINE</option>
                <option value="offline">OFFLINE</option>
              </select>
            </div>
            {currentGameId && (
              <div className="mobile-drawer-row">
                <span>ACTIVE SESSION:</span>
                <button 
                  onClick={() => {
                    setCurrentGameId(null);
                    setCurrentGame(null);
                    loadGames();
                    setMobileMenuOpen(false);
                  }}
                  className="header-btn-back"
                >
                  ← RETURN TO LAB
                </button>
              </div>
            )}
            <div className="mobile-drawer-row">
              <span>TELEMETRY SOUND:</span>
              <button
                onClick={() => setMuted(!muted)}
                className="header-btn-mute"
                style={{ padding: '4px 10px', fontSize: '11px', fontFamily: 'Share Tech Mono', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', cursor: 'pointer' }}
              >
                {muted ? <span style={{ color: 'var(--accent-magenta)' }}>MUTED</span> : <span style={{ color: '#10b981' }}>ACTIVE</span>}
              </button>
            </div>
            <div className="mobile-drawer-row">
              <span>SCIENTIST:</span>
              <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>{user.displayName || user.email.split('@')[0]}</span>
            </div>
            <div className="mobile-drawer-row">
              <span>DISCONNECT LOG:</span>
              <button 
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }} 
                className="header-btn-disconnect"
              >
                <LogOut className="h-4 w-4" /> DISCONNECT
              </button>
            </div>
          </div>
        )}
      </header>

      {/* --- DASHBOARD LOBBIES / ARCHIVE VIEW --- */}
      {!currentGameId ? (
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
                {joinSuccess && <div className="notice-success" style={{ padding: '8px', fontSize: '11px', fontFamily: 'Share Tech Mono', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '6px' }}>SUCCESS: {joinSuccess}</div>}
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
      ) : (
        /* --- ACTIVE CRUCIBLE SIMULATION VIEW --- */
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
                  <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                    <Trophy className="h-20 w-20 text-[#ffb703] animate-bounce" />
                    <h2 className="lobby-title-heading" style={{ fontSize: '28px' }}>CRUCIBLE COLLAPSED</h2>
                    <p className="recipe-book-desc" style={{ maxWidth: '400px' }}>
                      The transmutation sequence has reached final completion. Leaderboard values have been updated.
                    </p>

                    <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '16px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(157,78,223,0.1)' }}>
                      <h3 className="widget-title" style={{ textAlign: 'left', marginBottom: '12px' }}>FINAL STANDINGS</h3>
                      {[...currentGame.players].sort((a,b) => b.score - a.score).map((p, idx) => (
                        <div key={p.id} className="player-row" style={{ border: 'none', background: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRadius: '0' }}>
                          <span style={{ color: 'white' }}>{idx+1}. {p.name} {p.isAi ? '(AI)' : ''}</span>
                          <span className="player-score">{p.score} pts</span>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => { setCurrentGameId(null); setCurrentGame(null); loadGames(); }}
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
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%', minHeight: 0, overflow: 'hidden' }}>
                  <Leaderboard 
                    players={currentGame.players}
                    activePlayerIdx={currentGame.activePlayerIdx}
                    connectedPlayers={connectedPlayers}
                  />

                  <div className="logs-container">
                    <h3 className="widget-title widget-title-muted" style={{ borderBottom: '1px solid rgba(157,78,223,0.15)', paddingBottom: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
      )}

      {/* --- CREATE CRUCIBLE DIALOG MODAL --- */}
      {showCreateModal && (
        <CreateLobbyModal 
          createGameName={createGameName}
          setCreateGameName={setCreateGameName}
          maxPlayers={maxPlayers}
          setMaxPlayers={setMaxPlayers}
          maxTicks={maxTicks}
          setMaxTicks={setMaxTicks}
          handleCreateGame={handleCreateGame}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
