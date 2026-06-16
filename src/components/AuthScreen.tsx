import React from 'react';
import { Flame } from 'lucide-react';
import { SSOLoginPanel } from '../shared/auth/SSOLoginPanel';

interface AuthScreenProps {
  authError: string;
  redirectToAuth: () => void;
  playOnline: boolean;
  setPlayOnline: (v: boolean) => void;
  isGooglePolling?: boolean;
  onCancelGooglePoll?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  authError,
  redirectToAuth,
  playOnline,
  setPlayOnline,
  isGooglePolling = false,
  onCancelGooglePoll = () => {}
}) => {
  return (
    <SSOLoginPanel
      title="ALCHEMIST'S CRUCIBLE"
      subtitle="Transmutation Matrix Node"
      authError={authError}
      buttonText="ESTABLISH COMMAND CONNECTION"
      isGooglePolling={isGooglePolling}
      playOnline={playOnline}
      onPlayOnlineChange={setPlayOnline}
      onLoginClick={redirectToAuth}
      onCancelGooglePoll={onCancelGooglePoll}
      themeColor="#9d4edf" // Purple theme color
      icon={<Flame style={{ width: '48px', height: '48px' }} />}
      containerClassName="auth-container"
      cardClassName="glass-panel glass-panel-neon-purple auth-card"
      buttonClassName="btn-sci-fi btn-sci-fi-gold auth-btn-login"
      bgElement={<div className="lab-grid" />}
    />
  );
};
