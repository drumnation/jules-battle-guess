import { create } from 'zustand';

// Define the structure for a card used in the game
// Export the interface
export interface GameCard {
  id: string;
  name: string;
  hp?: string; // HP is crucial for comparison, make it optional for fetching robustness
  images: {
    small: string;
    large: string;
  };
}

// Define the possible phases of the game
// Export the type
export type GamePhase = 'welcome' | 'nameInput' | 'p1Select' | 'p2Select' | 'reveal' | 'result';

// Define the structure of our game state
// Export the interface
export interface GameState {
  phase: GamePhase;
  player1Name: string;
  player2Name: string;
  deck: GameCard[];
  player1Selection: GameCard | null;
  player2Selection: GameCard | null;
  winner: 'player1' | 'player2' | 'draw' | null;
  errorMessage: string | null; // For API or game logic errors
  isLoadingDeck: boolean;

  // Actions to modify the state
  setPhase: (phase: GamePhase) => void;
  setPlayerNames: (p1Name: string, p2Name: string) => void;
  setDeck: (cards: GameCard[]) => void;
  selectCard: (player: 'player1' | 'player2', card: GameCard) => void;
  revealWinner: () => void;
  resetGame: () => void; 
  setLoadingDeck: (isLoading: boolean) => void;
  setError: (message: string | null) => void;
}

// Create the Zustand store
export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  phase: 'welcome',
  player1Name: '',
  player2Name: '',
  deck: [],
  player1Selection: null,
  player2Selection: null,
  winner: null,
  errorMessage: null,
  isLoadingDeck: false,

  // --- Actions --- 
  setPhase: (phase) => set({ phase }),

  setPlayerNames: (p1Name, p2Name) => set({ 
    player1Name: p1Name || 'Player 1', // Default names if empty
    player2Name: p2Name || 'Player 2',
    phase: 'p1Select' // Move to player 1 selection after names are set
  }),

  setLoadingDeck: (isLoading) => set({ isLoadingDeck: isLoading }),

  setError: (message) => set({ errorMessage: message }),

  setDeck: (cards) => set({ deck: cards, isLoadingDeck: false, errorMessage: null }),

  selectCard: (player, card) => {
    if (player === 'player1') {
      set({ player1Selection: card, phase: 'p2Select' });
    } else {
      set({ player2Selection: card, phase: 'reveal' }); // Move to reveal after P2 selects
    }
  },

  revealWinner: () => {
    const { player1Selection, player2Selection } = get();
    if (!player1Selection || !player2Selection) return; // Should not happen in reveal phase

    const p1HP = parseInt(player1Selection.hp || '0', 10);
    const p2HP = parseInt(player2Selection.hp || '0', 10);

    let winnerResult: 'player1' | 'player2' | 'draw' | null = null;
    if (isNaN(p1HP) || isNaN(p2HP)) {
        // Handle cases where HP is missing or not a number
        set({ errorMessage: "Could not compare HP for one or both cards.", phase: 'result' });
        return;
    } 
    
    if (p1HP > p2HP) {
      winnerResult = 'player1';
    } else if (p2HP > p1HP) {
      winnerResult = 'player2';
    } else {
      winnerResult = 'draw';
    }
    set({ winner: winnerResult, phase: 'result' });
  },

  resetGame: () => set({
    phase: 'nameInput', // Go back to name input for a new game
    // Keep player names or reset them? Let's keep them for now.
    // player1Name: '',
    // player2Name: '',
    deck: [], // Clear the deck, will fetch new ones
    player1Selection: null,
    player2Selection: null,
    winner: null,
    errorMessage: null,
    isLoadingDeck: false,
  }),
})); 