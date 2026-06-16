import React from 'react';
import { Flame } from 'lucide-react';

interface AuthScreenProps {
  authError: string;
  redirectToAuth: () => void;
  playOnline: boolean;
  setPlayOnline: (v: boolean) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ authError, redirectToAuth, playOnline, setPlayOnline }) => {
  return (
    <div className="auth-container">
      <div className="lab-grid" />
      <div className="glass-panel glass-panel-neon-purple auth-card">
        <div className="auth-header">
          <Flame className="auth-icon" />
          <h1 className="auth-title">ALCHEMIST'S CRUCIBLE</h1>
          <p className="auth-subtitle">Transmutation Matrix Node</p>
        </div>

        {authError && (
          <div className="auth-error-banner">
            [ERROR] {authError}
          </div>
        )}

        <p className="auth-desc">
          Connect to the central KBS Cloud SSO directory to authorize alchemical matrix transmutations.
        </p>

        <button onClick={redirectToAuth} className="btn-sci-fi btn-sci-fi-gold auth-btn-login">
          ESTABLISH COMMAND CONNECTION
        </button>

        <div className="auth-offline-toggle">
          <label className="auth-offline-label">
            <input 
              type="checkbox" 
              checked={!playOnline} 
              onChange={() => setPlayOnline(!playOnline)} 
              className="auth-offline-checkbox"
            />
            PLAY OFFLINE / LOCAL MODE
          </label>
        </div>
      </div>
    </div>
  );
};
