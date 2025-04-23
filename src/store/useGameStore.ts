import { create } from 'zustand';
// import { PokemonCard } from '../../types'; // Remove incorrect import

// Define the PokemonCard type directly here
export interface PokemonCard {
  id: string;
  name: string;
  hp?: string; // HP is optional as some cards might not have it
  images: {
    small: string;
    large: string;
  };
  // Add other relevant fields if needed later
}

// Keep the alias for internal use if preferred, or just use PokemonCard directly
export type GameCard = PokemonCard;

// Define the possible game phases
type GamePhase = 'welcome' | 'nameInput' | 'p1Select' | 'p2Select' | 'reveal' | 'result';

interface GameState {
  phase: GamePhase;
  player1Name: string;
  player2Name: string;
  player1Card: PokemonCard | null;
  player2Card: PokemonCard | null;
  player1SelectionIndex: number | null;
  player2SelectionIndex: number | null;
  winner: 'player1' | 'player2' | 'draw' | null;
  deck: PokemonCard[];
  isLoadingDeck: boolean;
  errorMessage: string | null;
}

interface GameActions {
  setPhase: (phase: GamePhase) => void;
  setPlayerNames: (p1: string, p2: string) => void;
  setDeck: (deck: PokemonCard[]) => void;
  setLoadingDeck: (loading: boolean) => void;
  setError: (error: string | null) => void;
  selectCard: (player: 'player1' | 'player2', card: PokemonCard, index: number) => void;
  revealCards: () => void;
  playAgain: () => void;
}

const initialState: GameState = {
  phase: 'welcome',
  player1Name: 'Jules',
  player2Name: 'Dad',
  player1Card: null,
  player2Card: null,
  player1SelectionIndex: null,
  player2SelectionIndex: null,
  winner: null,
  deck: [],
  isLoadingDeck: false,
  errorMessage: null,
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  setPlayerNames: (p1, p2) => set({
    player1Name: p1 || initialState.player1Name,
    player2Name: p2 || initialState.player2Name,
    phase: 'p1Select',
    player1Card: null,
    player2Card: null,
    player1SelectionIndex: null,
    player2SelectionIndex: null,
    winner: null,
  }),

  setDeck: (deck) => set({
    deck,
    isLoadingDeck: false,
    errorMessage: null,
    player1Card: null,
    player2Card: null,
    player1SelectionIndex: null,
    player2SelectionIndex: null,
    winner: null,
  }),

  setLoadingDeck: (loading) => set({ isLoadingDeck: loading }),

  setError: (error) => set({
    errorMessage: error,
    isLoadingDeck: false,
    player1Card: null,
    player2Card: null,
    player1SelectionIndex: null,
    player2SelectionIndex: null,
    winner: null,
  }),

  selectCard: (player, card, index) => {
    console.log(`selectCard called by: ${player}, index: ${index}, card: ${card?.name}`);
    const state = get();
    console.log(`Current state before selection: phase=${state.phase}, p1Idx=${state.player1SelectionIndex}, p2Idx=${state.player2SelectionIndex}`);
    
    // Prevent selecting an already selected card index
    if (index === state.player1SelectionIndex || index === state.player2SelectionIndex) {
       console.log(`Selection prevented: Index ${index} already selected.`);
       return; 
    }

    if (player === 'player1') {
      console.log('Setting P1 selection, changing phase to p2Select');
      set({ player1Card: card, player1SelectionIndex: index, phase: 'p2Select' });
      // Optional: Clear P2 choice if P1 changes mind? Currently NO.
    } else { // Player 2
      console.log('Processing P2 selection...');
      // Ensure P1 has actually selected first
      if (state.player1Card && state.player1SelectionIndex !== null) {
         console.log('P1 card exists, setting P2 selection, changing phase to reveal');
         set({ player2Card: card, player2SelectionIndex: index, phase: 'reveal' });
      } else {
         // This case should ideally not be reachable due to phase logic
         console.warn("Player 1 must select a card first. P2 selection ignored.");
         // Optionally set an error message or handle differently
      }
    }
    // Log state *after* potential set
    // Note: This might log before the async set completes fully in some edge cases
    // console.log('State after selectCard attempt:', get()); 
  },

  revealCards: () => {
    const { player1Card, player2Card } = get();
    if (!player1Card || !player2Card) return;

    let winnerResult: 'player1' | 'player2' | 'draw' | null = null;
    const hp1 = parseInt(player1Card.hp || '0', 10);
    const hp2 = parseInt(player2Card.hp || '0', 10);

    if (hp1 > hp2) {
      winnerResult = 'player1';
    } else if (hp2 > hp1) {
      winnerResult = 'player2';
    } else {
      winnerResult = 'draw';
    }

    set({ winner: winnerResult, phase: 'result' });
  },

  playAgain: () => {
    set((state) => ({
      ...initialState,
      player1Name: state.player1Name,
      player2Name: state.player2Name,
      phase: 'p1Select',
      isLoadingDeck: true,
      deck: []
    }));
  },
})); 