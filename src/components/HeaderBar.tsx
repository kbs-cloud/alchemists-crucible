import React, { useState } from 'react';
import { 
  Flame, 
  User, 
  LogOut, 
  Volume2, 
  VolumeX, 
  Globe, 
  Menu, 
  X
} from 'lucide-react';

function getHubUrl(): string {
  if (typeof window === 'undefined') return 'http://localhost:19000';
  const proto = window.location.protocol === 'https:' ? 'https:' : 'http:';
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:19000';
  }
  return `${proto}//kbs-cloud.com`;
}

interface HeaderBarProps {
  playOnline: boolean;
  setPlayOnline: (online: boolean) => void;
  currentGameId: string | null;
  onReturnToLab: () => void;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  user: any;
  handleLogout: () => void;
}

export function HeaderBar({
  playOnline,
  setPlayOnline,
  currentGameId,
  onReturnToLab,
  muted,
  setMuted,
  user,
  handleLogout
}: HeaderBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
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
        {!currentGameId ? (
          <a 
            href={getHubUrl()} 
            className="header-btn-back" 
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            HUB CATALOG
          </a>
        ) : (
          <button 
            onClick={onReturnToLab}
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
          {!currentGameId ? (
            <div className="mobile-drawer-row">
              <span>HUB:</span>
              <a 
                href={getHubUrl()} 
                className="header-btn-back"
                style={{ textDecoration: 'none' }}
              >
                HUB CATALOG
              </a>
            </div>
          ) : (
            <div className="mobile-drawer-row">
              <span>ACTIVE SESSION:</span>
              <button 
                onClick={() => {
                  onReturnToLab();
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
  );
}
