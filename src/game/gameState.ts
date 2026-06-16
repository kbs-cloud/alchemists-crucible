export interface ElementDef {
  id: string;
  name: string;
  description: string;
  tier: number;
  color: string; // HSL color code
  isBase: boolean;
  points: number;
}

export interface Player {
  id: string;
  name: string;
  assignedEmail: string | null;
  isAi: boolean;
  isLocal: boolean;
  score: number;
  inventory: string[];
  endedTurn: boolean;
}

export interface GameState {
  gameId: string;
  name: string;
  status: 'setup' | 'playing' | 'completed';
  players: Player[];
  discoveredPool: string[]; // Shared list of elements unlocked
  crucible: string[]; // Active elements sitting in the cauldron (max 2)
  history: string[]; // Log of combinations and events
  turnCount: number;
  maxTicks: number; // Turn limit
  activePlayerIdx: number;
}

// 33 Elements Registry
export const ELEMENTS: Record<string, ElementDef> = {
  // Base (Tier 1)
  fire: { id: 'fire', name: 'Fire', description: 'Aggressive energy source.', tier: 1, color: 'hsl(0, 85%, 55%)', isBase: true, points: 5 },
  water: { id: 'water', name: 'Water', description: 'Soothing fluid flow.', tier: 1, color: 'hsl(210, 85%, 55%)', isBase: true, points: 5 },
  earth: { id: 'earth', name: 'Earth', description: 'Solid stable base.', tier: 1, color: 'hsl(30, 55%, 45%)', isBase: true, points: 5 },
  air: { id: 'air', name: 'Air', description: 'Light gas flow.', tier: 1, color: 'hsl(180, 50%, 70%)', isBase: true, points: 5 },

  // Tier 2
  steam: { id: 'steam', name: 'Steam', description: 'Vaporized hot moisture.', tier: 2, color: 'hsl(200, 25%, 75%)', isBase: false, points: 15 },
  lava: { id: 'lava', name: 'Lava', description: 'Molten glowing rock.', tier: 2, color: 'hsl(15, 95%, 50%)', isBase: false, points: 15 },
  energy: { id: 'energy', name: 'Energy', description: 'Charged motion state.', tier: 2, color: 'hsl(45, 95%, 55%)', isBase: false, points: 15 },
  mud: { id: 'mud', name: 'Mud', description: 'Wet packed soil.', tier: 2, color: 'hsl(35, 35%, 35%)', isBase: false, points: 15 },
  mist: { id: 'mist', name: 'Mist', description: 'Suspended condensation.', tier: 2, color: 'hsl(190, 35%, 70%)', isBase: false, points: 15 },
  dust: { id: 'dust', name: 'Dust', description: 'Tiny atmospheric particles.', tier: 2, color: 'hsl(40, 25%, 60%)', isBase: false, points: 15 },

  // Tier 3
  obsidian: { id: 'obsidian', name: 'Obsidian', description: 'Volcanic dark glass.', tier: 3, color: 'hsl(270, 25%, 20%)', isBase: false, points: 30 },
  stone: { id: 'stone', name: 'Stone', description: 'Cooled igneous matter.', tier: 3, color: 'hsl(0, 0%, 55%)', isBase: false, points: 25 },
  brick: { id: 'brick', name: 'Brick', description: 'Baked masonry component.', tier: 3, color: 'hsl(12, 60%, 48%)', isBase: false, points: 30 },
  metal: { id: 'metal', name: 'Metal', description: 'Refined dense mineral.', tier: 3, color: 'hsl(210, 15%, 70%)', isBase: false, points: 30 },
  sand: { id: 'sand', name: 'Sand', description: 'Granulated stone debris.', tier: 3, color: 'hsl(45, 50%, 75%)', isBase: false, points: 25 },
  glass: { id: 'glass', name: 'Glass', description: 'Translucent melted silicate.', tier: 3, color: 'hsl(180, 50%, 85%)', isBase: false, points: 35 },
  clay: { id: 'clay', name: 'Clay', description: 'Malleable earthy deposit.', tier: 3, color: 'hsl(25, 40%, 50%)', isBase: false, points: 30 },
  rainbow: { id: 'rainbow', name: 'Rainbow', description: 'Diffracted light spectrum.', tier: 3, color: 'hsl(300, 75%, 65%)', isBase: false, points: 40 },
  gunpowder: { id: 'gunpowder', name: 'Gunpowder', description: 'Combustible chemical powder.', tier: 3, color: 'hsl(0, 0%, 30%)', isBase: false, points: 35 },
  lightning: { id: 'lightning', name: 'Lightning', description: 'Violent static discharge.', tier: 3, color: 'hsl(60, 100%, 65%)', isBase: false, points: 35 },
  life: { id: 'life', name: 'Life', description: 'Self-replicating spark.', tier: 3, color: 'hsl(120, 80%, 60%)', isBase: false, points: 40 },

  // Tier 4
  plant: { id: 'plant', name: 'Plant', description: 'Photosynthetic organism.', tier: 4, color: 'hsl(140, 60%, 45%)', isBase: false, points: 45 },
  bacteria: { id: 'bacteria', name: 'Bacteria', description: 'Microscopic active entities.', tier: 4, color: 'hsl(90, 60%, 40%)', isBase: false, points: 45 },
  coal: { id: 'coal', name: 'Coal', description: 'Carbonized organic remains.', tier: 4, color: 'hsl(0, 0%, 15%)', isBase: false, points: 45 },
  diamond: { id: 'diamond', name: 'Diamond', description: 'Compressed carbon lattice.', tier: 4, color: 'hsl(180, 100%, 90%)', isBase: false, points: 60 },
  electricity: { id: 'electricity', name: 'Electricity', description: 'Flow of electron charges.', tier: 4, color: 'hsl(55, 95%, 65%)', isBase: false, points: 50 },
  magnet: { id: 'magnet', name: 'Magnet', description: 'Aligned magnetic fields.', tier: 4, color: 'hsl(220, 75%, 45%)', isBase: false, points: 50 },
  silicon: { id: 'silicon', name: 'Silicon', description: 'Metalloid semiconductor.', tier: 4, color: 'hsl(200, 20%, 60%)', isBase: false, points: 50 },

  // Tier 5 (Ultimate)
  microchip: { id: 'microchip', name: 'Microchip', description: 'Integrated circuit silicon wafer.', tier: 5, color: 'hsl(150, 75%, 45%)', isBase: false, points: 70 },
  computer: { id: 'computer', name: 'Computer', description: 'Logic calculation grid.', tier: 5, color: 'hsl(210, 80%, 45%)', isBase: false, points: 80 },
  ai: { id: 'ai', name: 'AI', description: 'Artificial superintelligence neural network.', tier: 5, color: 'hsl(285, 100%, 65%)', isBase: false, points: 100 },
  gold: { id: 'gold', name: 'Gold', description: 'Shining precious metal.', tier: 5, color: 'hsl(48, 100%, 50%)', isBase: false, points: 80 },
  philosophers_stone: { id: 'philosophers_stone', name: 'Philosopher\'s Stone', description: 'Legendary alchemical transmuter.', tier: 5, color: 'hsl(340, 100%, 55%)', isBase: false, points: 150 }
};

// Recipes Matrix
const RECIPES: Array<{ inputs: [string, string]; output: string }> = [
  // T2 Recipes
  { inputs: ['fire', 'water'], output: 'steam' },
  { inputs: ['fire', 'earth'], output: 'lava' },
  { inputs: ['fire', 'air'], output: 'energy' },
  { inputs: ['water', 'earth'], output: 'mud' },
  { inputs: ['water', 'air'], output: 'mist' },
  { inputs: ['earth', 'air'], output: 'dust' },

  // T3 Recipes
  { inputs: ['lava', 'water'], output: 'obsidian' },
  { inputs: ['lava', 'air'], output: 'stone' },
  { inputs: ['mud', 'fire'], output: 'brick' },
  { inputs: ['stone', 'fire'], output: 'metal' },
  { inputs: ['stone', 'air'], output: 'sand' },
  { inputs: ['sand', 'fire'], output: 'glass' },
  { inputs: ['sand', 'water'], output: 'clay' },
  { inputs: ['mist', 'fire'], output: 'rainbow' },
  { inputs: ['dust', 'fire'], output: 'gunpowder' },
  { inputs: ['air', 'energy'], output: 'lightning' },
  { inputs: ['energy', 'water'], output: 'life' },

  // T4 Recipes
  { inputs: ['life', 'earth'], output: 'plant' },
  { inputs: ['life', 'mud'], output: 'bacteria' },
  { inputs: ['plant', 'fire'], output: 'coal' },
  { inputs: ['coal', 'lava'], output: 'diamond' },
  { inputs: ['metal', 'energy'], output: 'electricity' },
  { inputs: ['metal', 'electricity'], output: 'magnet' },
  { inputs: ['metal', 'sand'], output: 'silicon' },

  // T5 Recipes
  { inputs: ['silicon', 'electricity'], output: 'microchip' },
  { inputs: ['microchip', 'electricity'], output: 'computer' },
  { inputs: ['computer', 'life'], output: 'ai' },
  { inputs: ['metal', 'fire'], output: 'gold' },
  { inputs: ['gold', 'life'], output: 'philosophers_stone' }
];

export function findRecipeOutput(el1: string, el2: string): string | null {
  const sortedInputs = [el1, el2].sort();
  for (const recipe of RECIPES) {
    const sortedRecipe = [...recipe.inputs].sort();
    if (sortedRecipe[0] === sortedInputs[0] && sortedRecipe[1] === sortedInputs[1]) {
      return recipe.output;
    }
  }
  return null;
}

export function generateRandomGameName(): string {
  const prefixes = ['Mystic', 'Aetheric', 'Thermal', 'Nebulous', 'Elemental', 'Luminous', 'Arcane'];
  const nouns = ['Crucible', 'Forge', 'Reactor', 'Chamber', 'Synthesizer', 'Conclave', 'Sanctum'];
  const p = prefixes[Math.floor(Math.random() * prefixes.length)];
  const n = nouns[Math.floor(Math.random() * nouns.length)];
  return `${p} ${n}`;
}

export function isPlayerVacant(player: Player, status?: string): boolean {
  if (status && status !== 'setup') return false;
  return !player.isAi && player.assignedEmail === null && player.name.startsWith('Apprentice ');
}

export function initializeGame(options: {
  name: string;
  hostName: string;
  hostEmail: string;
  maxPlayers: number;
  maxTicks?: number;
}): GameState {
  const gameId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const players: Player[] = [];
  // Setup apprentice player slots
  for (let i = 1; i <= options.maxPlayers; i++) {
    const isHost = i === 1;
    players.push({
      id: `player_${i}`,
      name: isHost ? options.hostName : `Apprentice ${i}`,
      assignedEmail: isHost ? options.hostEmail : null,
      isAi: false,
      isLocal: isHost,
      score: 0,
      inventory: ['fire', 'water', 'earth', 'air'], // Starting base elements
      endedTurn: false
    });
  }

  return {
    gameId,
    name: options.name,
    status: 'setup',
    players,
    discoveredPool: ['fire', 'water', 'earth', 'air'],
    crucible: [],
    history: ['Incubator crucible sequence initialized.'],
    turnCount: 1,
    maxTicks: options.maxTicks || 25,
    activePlayerIdx: 0
  };
}

export function executeAction(
  state: GameState,
  action: { type: 'combine' | 'start' | 'tick' | 'end_turn' | 'cancel_end_turn' | 'clear_crucible'; element1?: string; element2?: string; selectElement?: string },
  playerId: string
): { success: boolean; reason?: string; newState: GameState } {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  const player = newState.players.find(p => p.id === playerId);
  
  if (action.type === 'start') {
    if (newState.status !== 'setup') {
      return { success: false, reason: 'Game has already started.', newState: state };
    }
    newState.status = 'playing';
    newState.history.push('The crucible has been ignited! Let the transmutations begin.');
    return { success: true, newState };
  }

  if (newState.status !== 'playing') {
    return { success: false, reason: 'Game is not in progress.', newState: state };
  }

  if (!player) {
    return { success: false, reason: 'Player slot not found.', newState: state };
  }

  const activePlayer = newState.players[newState.activePlayerIdx];
  const isPlayerTurn = activePlayer && activePlayer.id === playerId;

  if (!isPlayerTurn) {
    return { success: false, reason: 'It is not your turn.', newState: state };
  }

  if (action.type === 'clear_crucible') {
    newState.crucible = [];
    newState.history.push(`${player.name} cleared the active crucible.`);
    return { success: true, newState };
  }

  if (action.type === 'combine') {
    const { element1, element2 } = action;
    if (!element1 || !element2) {
      return { success: false, reason: 'Requires two elements to combine.', newState: state };
    }

    // Verify player possesses elements
    if (!player.inventory.includes(element1) || !player.inventory.includes(element2)) {
      return { success: false, reason: 'You do not possess these elements in your inventory.', newState: state };
    }

    // Clear crucible and place elements
    newState.crucible = [element1, element2];

    const result = findRecipeOutput(element1, element2);
    if (!result) {
      newState.history.push(`${player.name} mixed ${ELEMENTS[element1]?.name} + ${ELEMENTS[element2]?.name} but the mixture dissipated into steam.`);
      // Clear crucible on failure too so it doesn't linger
      newState.crucible = [];
      
      // Auto-end turn on combination attempt (gives tension!)
      return autoEndTurn(newState, playerId);
    }

    const outputDef = ELEMENTS[result];
    const isNewGlobalDiscovery = !newState.discoveredPool.includes(result);

    // Primary score reward: more points if player is the first to unlock it globally!
    const pointsAwarded = isNewGlobalDiscovery ? outputDef.points * 2 : outputDef.points;

    player.score += pointsAwarded;
    
    // Add to shared pool if new
    if (isNewGlobalDiscovery) {
      newState.discoveredPool.push(result);
    }

    // Add to individual inventories for ALL players in the game so everyone can use unlocked Tier elements,
    // OR just to the current player's inventory? Let's give it to the current player to unlock progression,
    // and also add it to the discovered pool so others can unlock/learn it.
    // Wait, let's add it to the current player's inventory. If they unlock it, they get to keep it.
    if (!player.inventory.includes(result)) {
      player.inventory.push(result);
    }

    // Sync inventory with discovered pool - let's make it so all players can immediately see and buy/claim
    // any elements unlocked globally to use in their hands. This is nice and simple!
    // To make it fun: all players automatically receive a card of the newly discovered element in their recipe book.
    newState.players.forEach(p => {
      if (!p.inventory.includes(result)) {
        p.inventory.push(result);
      }
    });

    newState.history.push(
      `✨ ${player.name} synthesized ${outputDef.name} (${outputDef.description})! ` +
      `Awarded +${pointsAwarded} points.${isNewGlobalDiscovery ? ' (Global First Discovery!)' : ''}`
    );

    // Check Win Condition: Philosopher's Stone discovered
    if (result === 'philosophers_stone' || result === 'ai') {
      newState.status = 'completed';
      newState.history.push(`🏆 THE ULTIMATE ELEMENT HAS BEEN SYNTHESIZED! ${player.name} wins the Crucible!`);
      return { success: true, newState };
    }

    // Clear crucible after successful combination
    newState.crucible = [];

    return autoEndTurn(newState, playerId);
  }

  if (action.type === 'end_turn') {
    return autoEndTurn(newState, playerId);
  }

  return { success: false, reason: 'Unknown command.', newState: state };
}

function autoEndTurn(newState: GameState, _playerId: string): { success: boolean; newState: GameState } {
  // Advance active player index
  const activeHumans = newState.players.filter(p => !isPlayerVacant(p, newState.status));
  
  if (activeHumans.length === 0) {
    return { success: true, newState };
  }

  let nextIdx = (newState.activePlayerIdx + 1) % newState.players.length;
  
  // Skip vacant slots
  while (isPlayerVacant(newState.players[nextIdx], newState.status)) {
    nextIdx = (nextIdx + 1) % newState.players.length;
  }

  newState.activePlayerIdx = nextIdx;

  // If we wrapped back to the host (index 0), increment turn count
  if (nextIdx === 0) {
    newState.turnCount += 1;
    newState.history.push(`--- Turn ${newState.turnCount} Commences ---`);
    
    // Check game end conditions
    if (newState.turnCount > newState.maxTicks) {
      newState.status = 'completed';
      // Sort players by score
      const winner = [...newState.players].sort((a,b) => b.score - a.score)[0];
      newState.history.push(`⌛ Turn limit reached! ${winner ? winner.name : 'No one'} wins with a score of ${winner ? winner.score : 0} points!`);
    }
  }

  // Handle AI turn automatically if next player is AI
  const nextPlayer = newState.players[newState.activePlayerIdx];
  if (nextPlayer && nextPlayer.isAi && newState.status === 'playing') {
    // Run AI routine
    runAiTurn(newState, nextPlayer.id);
  }

  return { success: true, newState };
}

function runAiTurn(state: GameState, aiPlayerId: string) {
  const aiPlayer = state.players.find(p => p.id === aiPlayerId);
  if (!aiPlayer) return;

  // AI selects two random elements from its inventory and tries to combine them
  const inv = aiPlayer.inventory;
  if (inv.length < 2) return;

  // Let's look for any valid combinations the AI can do
  let validPair: [string, string] | null = null;
  for (let i = 0; i < inv.length; i++) {
    for (let j = i + 1; j < inv.length; j++) {
      const output = findRecipeOutput(inv[i], inv[j]);
      // If a valid combination exists and hasn't been discovered by this AI yet, prioritize it
      if (output && !aiPlayer.inventory.includes(output)) {
        validPair = [inv[i], inv[j]];
        break;
      }
    }
    if (validPair) break;
  }

  // If no new recipe found, pick two random elements that can actually form a recipe
  if (!validPair) {
    for (let i = 0; i < inv.length; i++) {
      for (let j = i + 1; j < inv.length; j++) {
        if (findRecipeOutput(inv[i], inv[j])) {
          validPair = [inv[i], inv[j]];
          break;
        }
      }
      if (validPair) break;
    }
  }

  // If still nothing, just grab two random elements from inventory to demonstrate a failed mixture
  if (!validPair) {
    const idx1 = Math.floor(Math.random() * inv.length);
    let idx2 = Math.floor(Math.random() * inv.length);
    while (idx2 === idx1 && inv.length > 1) {
      idx2 = Math.floor(Math.random() * inv.length);
    }
    validPair = [inv[idx1], inv[idx2]];
  }

  const [el1, el2] = validPair;
  const result = findRecipeOutput(el1, el2);
  
  if (result) {
    const outputDef = ELEMENTS[result];
    const isNewGlobalDiscovery = !state.discoveredPool.includes(result);
    const pointsAwarded = isNewGlobalDiscovery ? outputDef.points * 2 : outputDef.points;

    aiPlayer.score += pointsAwarded;
    if (isNewGlobalDiscovery) {
      state.discoveredPool.push(result);
    }
    if (!aiPlayer.inventory.includes(result)) {
      aiPlayer.inventory.push(result);
    }
    
    // Add to all inventories
    state.players.forEach(p => {
      if (!p.inventory.includes(result)) {
        p.inventory.push(result);
      }
    });

    state.history.push(
      `🤖 AI Apprentice (${aiPlayer.name}) combined ${ELEMENTS[el1]?.name} + ${ELEMENTS[el2]?.name} and synthesized ${outputDef.name}! ` +
      `Awarded +${pointsAwarded} points.`
    );

    if (result === 'philosophers_stone' || result === 'ai') {
      state.status = 'completed';
      state.history.push(`🏆 THE ULTIMATE ELEMENT HAS BEEN SYNTHESIZED! AI ${aiPlayer.name} wins the Crucible!`);
      return;
    }
  } else {
    state.history.push(`🤖 AI Apprentice (${aiPlayer.name}) mixed ${ELEMENTS[el1]?.name} + ${ELEMENTS[el2]?.name} but it evaporated.`);
  }

  // Move to next player
  let nextIdx = (state.activePlayerIdx + 1) % state.players.length;
  while (isPlayerVacant(state.players[nextIdx], state.status)) {
    nextIdx = (nextIdx + 1) % state.players.length;
  }
  state.activePlayerIdx = nextIdx;

  if (nextIdx === 0) {
    state.turnCount += 1;
    state.history.push(`--- Turn ${state.turnCount} Commences ---`);
    if (state.turnCount > state.maxTicks) {
      state.status = 'completed';
      const winner = [...state.players].sort((a,b) => b.score - a.score)[0];
      state.history.push(`⌛ Turn limit reached! ${winner ? winner.name : 'No one'} wins with a score of ${winner ? winner.score : 0} points!`);
    }
  }

  // If next is ALSO AI, run it recursively (but handle safely)
  const nextPlayer = state.players[state.activePlayerIdx];
  if (nextPlayer && nextPlayer.isAi && state.status === 'playing') {
    runAiTurn(state, nextPlayer.id);
  }
}
