import React from 'react';

interface CreateLobbyModalProps {
  createGameName: string;
  setCreateGameName: (name: string) => void;
  maxPlayers: number;
  setMaxPlayers: (count: number) => void;
  maxTicks: number;
  setMaxTicks: (count: number) => void;
  handleCreateGame: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const CreateLobbyModal: React.FC<CreateLobbyModalProps> = ({
  createGameName,
  setCreateGameName,
  maxPlayers,
  setMaxPlayers,
  maxTicks,
  setMaxTicks,
  handleCreateGame,
  onClose
}) => {
  return (
    <div className="modal-overlay">
      <div className="glass-panel glass-panel-neon-purple modal-container">
        <h2 className="modal-header">
          SETUP ALCHEMICAL CORE
        </h2>
        <form onSubmit={handleCreateGame} className="modal-form">
          <div className="form-group">
            <label className="form-label">Reactor Core Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Arcane Crucible"
              className="terminal-input"
              value={createGameName}
              onChange={e => setCreateGameName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Apprentice Slots (Max Players)</label>
            <select 
              className="terminal-input"
              value={maxPlayers}
              onChange={e => setMaxPlayers(parseInt(e.target.value))}
            >
              <option value={2}>2 Apprentices</option>
              <option value={3}>3 Apprentices</option>
              <option value={4}>4 Apprentices</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Transmutation Turn Limit</label>
            <input 
              type="number" 
              min={10} 
              max={100}
              className="terminal-input"
              value={maxTicks}
              onChange={e => setMaxTicks(parseInt(e.target.value))}
            />
          </div>

          <div className="modal-footer">
            <button type="submit" className="btn-sci-fi btn-sci-fi-gold" style={{ flex: 1 }}>
              IGNITE CORE
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="btn-sci-fi btn-danger"
              style={{ flex: 1 }}
            >
              ABORT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
