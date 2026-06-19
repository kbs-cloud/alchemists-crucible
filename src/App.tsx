import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { GameState } from './game/gameState';
import { authService, gameService } from './services';
import { startSSOBackgroundCheck, redirectToSSO } from './shared/auth/sso-helper';

// Subcomponents
import { AuthScreen } from './components/AuthScreen';
import { CreateLobbyModal } from './components/CreateLobbyModal';
import { HeaderBar } from './components/HeaderBar';
import { Dashboard } from './components/Dashboard';
import { GameView } from './components/GameView';

export default function App() {
  const [playOnline, setPlayOnline] = useState<boolean>(() => localStorage.getItem('alchemist_play_online') !== 'false');
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isGooglePolling, setIsGooglePolling] = useState(false);
  const [loaderText, setLoaderText] = useState('IGNITING THE LAB FURNACE...');
  const ssoCheckedRef = useRef(false);

  const [muted, setMuted] = useState(true);

  // Dashboard state
  const [games, setGames] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createGameName, setCreateGameName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(3);
  const [maxTicks, setMaxTicks] = useState(25);

  // Active Game State
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [currentGame, setCurrentGame] = useState<GameState | null>(null);
  const [connectedPlayers, setConnectedPlayers] = useState<string[]>([]);

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
    let cleanupBackgroundCheck: (() => void) | null = null;

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
          
          cleanupBackgroundCheck = startSSOBackgroundCheck({
            clientId: 'alchemist',
            onSuccess: async () => {
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
            },
            onFinished: () => {
              if (active) {
                setAuthLoading(false);
                const params = new URLSearchParams(window.location.search);
                const error = params.get('error');
                if (error) {
                  setAuthError(error === 'session_fail' ? 'Session establishment failed.' : error);
                  window.history.replaceState(null, '', window.location.pathname);
                }
              }
            }
          });
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
      if (cleanupBackgroundCheck) {
        cleanupBackgroundCheck();
      }
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
    
    if (isPackaged) {
      const token = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('alchemist_auth_pending_token', token);
      redirectToSSO('alchemist', `source=electron&token=${token}`);
      setIsGooglePolling(true);
    } else {
      redirectToSSO('alchemist');
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

  const handleAssignSlot = async (playerId: string, assignOptions: { email?: string | null, isAi?: boolean, isLocal?: boolean, name?: string }) => {
    if (!currentGameId) return;
    try {
      await gameService.assignSlot(currentGameId, playerId, assignOptions);
      await pollGame();
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

  const handleReturnToLab = () => {
    if (confirm("Decommission this crucible view and return to active laboratories?")) {
      setCurrentGameId(null);
      setCurrentGame(null);
      loadGames();
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

  return (
    <div className="app-container">
      <div className="lab-grid" />

      <HeaderBar 
        playOnline={playOnline}
        setPlayOnline={setPlayOnline}
        currentGameId={currentGameId}
        onReturnToLab={handleReturnToLab}
        muted={muted}
        setMuted={setMuted}
        user={user}
        handleLogout={handleLogout}
      />

      {!currentGameId ? (
        <Dashboard 
          user={user}
          games={games}
          loadGames={loadGames}
          setCurrentGameId={setCurrentGameId}
          handleDeleteGame={handleDeleteGame}
          setShowCreateModal={setShowCreateModal}
        />
      ) : (
        <GameView 
          currentGame={currentGame}
          currentGameId={currentGameId}
          user={user}
          connectedPlayers={connectedPlayers}
          joinRequests={joinRequests}
          muted={muted}
          pollGame={pollGame}
          setCurrentGame={setCurrentGame}
          setCurrentGameId={setCurrentGameId}
          loadGames={loadGames}
          handleAssignSlot={handleAssignSlot}
          handleStartGame={handleStartGame}
        />
      )}

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
