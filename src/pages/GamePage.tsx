import { useEffect, useState, useRef } from 'react';
import { useGameStore, GameCard, PokemonCard } from "../store/useGameStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardGrid } from "../components/game/CardGrid";
import { SingleCardDisplay } from "../components/game/SingleCardDisplay";
import { FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Sound file paths
const COIN_SOUND_PATH = '/coin.mp3';
const WINNER_SOUND_PATH = '/sounds/winner.mp3'; // Placeholder
const LOSER_SOUND_PATH = '/sounds/loser.mp3';   // Placeholder (use for draw too?)

// Helper function to play a sound effect
const playSound = (soundPath: string) => {
  try {
    const audio = new Audio(soundPath);
    audio.volume = 0.3; // Optional: Adjust volume (0.0 to 1.0)
    audio.play().catch(error => console.error(`Error playing sound ${soundPath}:`, error));
  } catch (error) {
     console.error(`Failed to load sound ${soundPath}:`, error);
  }
};

// Define specific types for the callback functions used by fetchGameDeck
type SetDeckFunc = (cards: GameCard[]) => void;
type SetLoadingFunc = (isLoading: boolean) => void;
type SetErrorFunc = (message: string | null) => void;

// Fisher-Yates (Knuth) Shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length, randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

// Fetch cards
async function fetchGameDeck(setDeck: SetDeckFunc, setLoading: SetLoadingFunc, setError: SetErrorFunc) {
  setLoading(true);
  setError(null);
  const TARGET_DECK_SIZE = 15;
  const FETCH_PAGE_SIZE = 100; // Fetch a larger pool

  try {
    console.log(`Fetching ${FETCH_PAGE_SIZE} cards...`);
    // Removed orderBy=random, fetching larger size
    const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=supertype:pokemon&pageSize=${FETCH_PAGE_SIZE}`); 
    if (!response.ok) {
      throw new Error(`API error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data && Array.isArray(data.data)) {
        // Explicitly type the filtered array
        const cardsWithHp: PokemonCard[] = data.data.filter(
            (card: any): card is PokemonCard => card && card.hp && parseInt(card.hp, 10) > 0
        );
        console.log(`Fetched ${data.data.length}, found ${cardsWithHp.length} valid cards with HP.`);

        if (cardsWithHp.length < TARGET_DECK_SIZE) { 
            // Handle case where even the larger fetch didn't yield enough cards
            console.warn(`Could not find enough cards (${TARGET_DECK_SIZE}) with HP after fetching ${FETCH_PAGE_SIZE}. Using ${cardsWithHp.length} cards.`);
            if (cardsWithHp.length < 2) {
                 throw new Error('Not enough valid cards fetched from API for a game (minimum 2 required).');
            }
             // Explicitly type the shuffled array before setting
             const shuffledSubset: PokemonCard[] = shuffleArray([...cardsWithHp]); // Use spread to avoid modifying original
             setDeck(shuffledSubset); 
        } else {
             // Explicitly type the shuffled array
             const shuffledCards: PokemonCard[] = shuffleArray([...cardsWithHp]); // Use spread to avoid modifying original
             const finalDeck = shuffledCards.slice(0, TARGET_DECK_SIZE);
             console.log(`Selected ${finalDeck.length} cards for the game deck.`);
             setDeck(finalDeck); 
        }
    } else {
      throw new Error('Invalid deck data structure from API.');
    }
  } catch (err) {
    console.error("Error fetching game deck:", err);
    if (err instanceof Error) {
      setError(`Failed to load deck: ${err.message}`);
    } else {
       setError('An unknown error occurred while loading the deck.');
    }
  }
   // setLoading(false) is handled by setDeck or setError
}

// Animation variants for phases
const phaseVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export function GamePage() {
  const { phase, player1Name, player2Name, player1Card, player2Card, player1SelectionIndex, player2SelectionIndex, winner, deck, isLoadingDeck, errorMessage, setPlayerNames, setDeck, setLoadingDeck, setError, selectCard, revealCards, playAgain } = useGameStore((state) => state);
  const [p1InputName, setP1InputName] = useState(player1Name);
  const [p2InputName, setP2InputName] = useState(player2Name);
  const hasPlayedResultSound = useRef(false);
  const [countdown, setCountdown] = useState<number | null>(null); // State for countdown timer

  // Fetch deck when component mounts or when starting new game
  useEffect(() => {
    // If navigating directly to game and phase is welcome, move to name input
    if (phase === 'welcome') {
      useGameStore.getState().setPhase('nameInput');
    } 
    // Fetch deck if we are in a selection phase and the deck is empty.
    // The !isLoadingDeck check is removed here because playAgain sets it to true,
    // but we still need to fetch. fetchGameDeck handles setting loading internally.
    else if ((phase === 'p1Select' || phase === 'nameInput') && deck.length === 0) {
      fetchGameDeck(setDeck, setLoadingDeck, setError);
    } 
  }, [phase, deck.length, setDeck, setLoadingDeck, setError]); // Removed isLoadingDeck dependency here as it caused the issue

  // Sync local input state if store names change (e.g., after reset/play again)
  useEffect(() => {
    setP1InputName(player1Name);
    setP2InputName(player2Name);
  }, [player1Name, player2Name]);

  // Effect for playing result sound
  useEffect(() => {
    if (phase === 'result' && !hasPlayedResultSound.current) {
      if (winner === 'player1' || winner === 'player2') {
        playSound(WINNER_SOUND_PATH);
      } else { // Draw
        playSound(LOSER_SOUND_PATH); // Using loser sound for draw for now
      }
      hasPlayedResultSound.current = true; // Mark sound as played for this result phase
    } else if (phase !== 'result') {
      // Reset the flag when leaving the result phase
      hasPlayedResultSound.current = false;
    }
  }, [phase, winner]); // Depend on phase and winner

  // useEffect for Reveal Countdown Timer
  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;

    if (phase === 'reveal') {
      setCountdown(3); // Start countdown
      timerId = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timerId);
            revealCards(); // Trigger results after countdown
            return null; 
          }
          return prev - 1;
        });
      }, 1000); // 1 second interval
    } else {
      // Clear countdown if phase changes
      setCountdown(null);
    }

    // Cleanup function to clear interval if component unmounts or phase changes
    return () => {
      if (timerId) {
         clearInterval(timerId);
      }
    };
  }, [phase, revealCards]); // Depend on phase and the revealCards action

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSound(COIN_SOUND_PATH);
    setPlayerNames(p1InputName, p2InputName);
  };

  // Handle card selection with sound and index
  const handleSelectCard = (player: 'player1' | 'player2', card: PokemonCard, index: number) => {
    playSound(COIN_SOUND_PATH);
    const currentPhase = useGameStore.getState().phase;
    if ((player === 'player1' && currentPhase === 'p1Select') || (player === 'player2' && currentPhase === 'p2Select')) {
      selectCard(player, card, index);
    } else {
      console.warn(`Card selection attempted in incorrect phase: ${currentPhase}`);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center overflow-hidden">
      <motion.h2 
         className="text-3xl font-bold mb-6 font-game"
         initial={{ scale: 0.5, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
      >
        Battle Guess!
      </motion.h2>

      <div className="w-full flex flex-col items-center"> {/* Container for animated phases */} 
        <AnimatePresence mode="wait"> 
          
          {/* --- Loading State --- */}
          {isLoadingDeck && (
            <motion.div
              key="loading"
              variants={phaseVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-3 mt-8 text-xl"
            >
              <FaSpinner className="animate-spin text-4xl text-primary" /> 
              <span>Shuffling the deck...</span>
            </motion.div>
          )}
          
          {/* --- Error Display --- */}
          {errorMessage && !isLoadingDeck && (
            <motion.div
              key="error"
              variants={phaseVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="mt-4 text-lg text-red-500 p-4 bg-red-900/20 rounded border border-red-500/50 w-full max-w-md text-center"
            >
              Error: {errorMessage}
              {/* Optionally add a retry button here? */}
            </motion.div>
          )}

          {/* Render game phases only if not loading and no error */} 
          {!isLoadingDeck && !errorMessage && (
            <> 
              {/* --- Name Input Phase --- */}
              {!isLoadingDeck && !errorMessage && phase === 'nameInput' && (
                <motion.div
                  key="nameInput"
                  variants={phaseVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="w-full flex justify-center"
                >
                  <form onSubmit={handleNameSubmit} className="flex flex-col gap-4 items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-sm">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Enter Player Names</h3>
                    <Input 
                      placeholder="Player 1 Name" 
                      value={p1InputName}
                      onChange={(e) => setP1InputName(e.target.value)}
                      className="dark:bg-gray-700 dark:text-white text-gray-900"
                      required
                    />
                    <Input 
                      placeholder="Player 2 Name" 
                      value={p2InputName}
                      onChange={(e) => setP2InputName(e.target.value)}
                      className="dark:bg-gray-700 dark:text-white text-gray-900"
                      required
                    />
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button type="submit" className="mt-2">Start Battle!</Button> 
                    </motion.div>
                  </form>
                </motion.div>
              )}

              {/* --- Player 1 Select Phase --- */}
              {!isLoadingDeck && !errorMessage && phase === 'p1Select' && (
                <motion.div
                  key="p1Select"
                  variants={phaseVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center w-full"
                >
                  <h3 className="text-xl font-semibold my-4">{player1Name}, pick a card (secretly)!</h3>
                  <CardGrid cards={deck} onSelectCard={(card, index) => handleSelectCard('player1', card, index)} showBacks={true} player1SelectionIndex={player1SelectionIndex} player2SelectionIndex={player2SelectionIndex} player1Name={player1Name} player2Name={player2Name} />
                </motion.div>
              )}

              {/* --- Player 2 Select Phase --- */}
              {!isLoadingDeck && !errorMessage && phase === 'p2Select' && (
                <motion.div
                  key="p2Select"
                  variants={phaseVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center w-full"
                >
                  <h3 className="text-xl font-semibold my-4">{player2Name}, pick your card (secretly)!</h3>
                  <CardGrid cards={deck} onSelectCard={(card, index) => handleSelectCard('player2', card, index)} showBacks={true} player1SelectionIndex={player1SelectionIndex} player2SelectionIndex={player2SelectionIndex} player1Name={player1Name} player2Name={player2Name} />
                </motion.div>
              )}
              
              {/* --- Reveal Phase --- */}
              {!isLoadingDeck && !errorMessage && phase === 'reveal' && player1Card && player2Card && (
                <motion.div
                  key="reveal"
                  variants={phaseVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center w-full"
                >
                  {/* Display countdown OR cards based on timer state */} 
                  {countdown !== null ? (
                     <motion.div
                       key={countdown} // Change key to trigger animation
                       initial={{ scale: 1.5, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       transition={{ duration: 0.3 }}
                       className="text-6xl sm:text-8xl font-bold my-12 font-game text-primary drop-shadow-lg"
                     >
                       {countdown}
                     </motion.div>
                  ) : (
                     // Show cards only after countdown starts (or if no countdown)
                     <> {/* Use fragment */} 
                       <h3 className="text-xl font-semibold my-4">Revealing cards...</h3>
                       <div className="flex flex-col md:flex-row gap-6 mt-4 items-start justify-center">
                         <div className="flex flex-col items-center text-center">
                           <h4 className="text-lg font-medium mb-2">{player1Name}'s Card</h4>
                           <SingleCardDisplay card={player1Card} showBacks={false} playerName={player1Name} /> 
                         </div>
                         <span className="text-2xl font-bold self-center my-4 md:my-0 mx-4">VS</span>
                         <div className="flex flex-col items-center text-center">
                           <h4 className="text-lg font-medium mb-2">{player2Name}'s Card</h4>
                           <SingleCardDisplay card={player2Card} showBacks={false} playerName={player2Name} /> 
                         </div>
                       </div>
                       {/* Removed the See Result Button */}
                     </>
                  )}
                </motion.div>
              )}

              {/* --- Result Phase --- */}
              {!isLoadingDeck && !errorMessage && phase === 'result' && player1Card && player2Card && (
                <motion.div
                  key="result"
                  variants={phaseVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center w-full"
                >
                  <h3 className="text-xl font-semibold my-4">Results!</h3>
                  {/* Display Winner */}
                  <div className={`text-2xl font-bold mb-6 p-4 rounded-lg 
                    ${winner === 'player1' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : ''}
                    ${winner === 'player2' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' : ''}
                    ${winner === 'draw' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' : ''}
                  `}>
                    {winner === 'draw' 
                      ? "It's a Draw!"
                      : `${winner === 'player1' ? player1Name : player2Name} Wins!`
                    }
                  </div>

                  {/* Display Chosen Cards Again with highlight */}
                  <div className="flex flex-col md:flex-row gap-6 mt-4 items-start justify-center">
                    {/* Player 1 Card with winner/loser styling - Use SingleCardDisplay */} 
                    <div className="flex flex-col items-center text-center">
                      <h4 className="text-lg font-medium mb-2">{player1Name}'s Card ({player1Card.hp} HP)</h4>
                      <SingleCardDisplay 
                        card={player1Card} 
                        showBacks={false}
                        isWinner={winner === 'player1'}
                        isLoser={winner === 'player2'}
                        isDraw={winner === 'draw'}
                        playerName={player1Name}
                      /> 
                    </div>
                    <span className="text-2xl font-bold self-center my-4 md:my-0 mx-4">VS</span>
                    {/* Player 2 Card with winner/loser styling - Use SingleCardDisplay */} 
                    <div className="flex flex-col items-center text-center">
                      <h4 className="text-lg font-medium mb-2">{player2Name}'s Card ({player2Card.hp} HP)</h4>
                      <SingleCardDisplay 
                        card={player2Card} 
                        showBacks={false}
                        isWinner={winner === 'player2'}
                        isLoser={winner === 'player1'}
                        isDraw={winner === 'draw'}
                        playerName={player2Name}
                      /> 
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={playAgain} className="mt-8">Play Again?</Button>
                  </motion.div>
                </motion.div>
              )}
            </> 
          )}

        </AnimatePresence>
      </div> {/* Close container div */} 
    </div>
  );
} 