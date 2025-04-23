import { create } from 'zustand';

// Define possible game phases
type GamePhase = 'SETUP' | 'PLAYER_SELECT' | 'REVEAL' | 'RESULT';

// Define the structure for a player
interface Player {
  name: string;
  // Add deck, selected card, score later
}

// Define the state structure
interface GameState {
  phase: GamePhase;
  players: Player[];
  // Add decks, selected cards, winner later
  setPhase: (newPhase: GamePhase) => void;
  startGame: () => void; // Action to initiate the game
}

// Create the Zustand store
export const useGameStore = create<GameState>((set) => ({
  phase: 'SETUP', // Initial phase
  players: [
    { name: 'Player 1' }, // Placeholder names
    { name: 'Player 2' },
  ],
  setPhase: (newPhase) => set({ phase: newPhase }),
  
  // Action to move from SETUP to the next phase (e.g., PLAYER_SELECT)
  // We'll add deck fetching logic here later
  startGame: () => {
    console.log("Starting game..."); // Placeholder logic
    set({ phase: 'PLAYER_SELECT' }); 
  },
})); 