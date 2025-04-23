import { PokemonCard } from "../../store/useGameStore";
import { motion } from 'framer-motion';

const CARD_BACK_URL = "https://images.pokemontcg.io/dp1/123_hires.png"; 

interface SingleCardDisplayProps {
  card: PokemonCard | null;
  showBacks?: boolean;
  isWinner?: boolean;
  isLoser?: boolean;
  isDraw?: boolean;
  playerName?: string; // Optional: For accessibility or future use
}

export function SingleCardDisplay({
  card,
  showBacks = false,
  isWinner = false,
  isLoser = false,
  isDraw = false,
  playerName = 'Card'
}: SingleCardDisplayProps) {

  if (!card) {
    // Render a placeholder or nothing if no card is provided
    return <div className="w-[150px] h-[210px] bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 italic">No Card</div>; // Example placeholder size
  }

  // Determine visual state based on props
  const isVisuallyWinner = isWinner && !isDraw;
  const isVisuallyLoser = isLoser && !isDraw;
  const isVisuallyDraw = isDraw;

  return (
    // Added perspective here for individual card flip
    <div className="[perspective:1000px]">
      <motion.div
        key={card.id} // Use card id for key
        className={`
          relative 
          flex flex-col items-center p-1 rounded-lg 
          transition-opacity duration-300 ease-in-out 
          max-w-xs /* Increased card size significantly */
          
          /* Base Result Styling (applied first) */
          ${isVisuallyWinner ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-gray-900 shadow-xl shadow-yellow-400/60' : ''}
          ${isVisuallyLoser ? 'opacity-50 grayscale' : ''}
          ${isVisuallyDraw ? 'ring-2 ring-gray-500 ring-offset-2 ring-offset-gray-900' : ''} 
        `}
        style={{ transformStyle: 'preserve-3d' }} 
        title={`${playerName}: ${card.name}`}
        animate={{
            scale: isVisuallyWinner ? 1.1 : 1, // Scale up winner
            // Add a subtle pulse to the winner's shadow/glow
            boxShadow: isVisuallyWinner 
                ? `0 0 25px 5px rgba(250, 204, 21, 0.6)` 
                : (isVisuallyLoser || isVisuallyDraw ? 'none' : '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)'), // Default shadow otherwise, none for loser/draw
        }}
        transition={{
            duration: 0.5, // Transition for scale/shadow
            // Add repeating pulse for winner's shadow
            boxShadow: isVisuallyWinner ? { duration: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" } : { duration: 0.5 }
        }}
      >
        {/* Card Face/Back Container - Applying animation here */}
        <motion.div
          className="w-full"
          initial={false} // Animate only on change
          animate={{ rotateY: showBacks ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{ transformStyle: 'preserve-3d' }} 
        >
          {/* Front of Card */}
          <div style={{ backfaceVisibility: 'hidden' }}>
            <img 
              src={card.images.small} 
              alt={card.name}
              className="w-full h-auto rounded-md shadow-sm"
            />
            {card.hp && (
              <span className="mt-1 text-xs font-semibold bg-gray-700 text-white px-1.5 py-0.5 rounded">
                HP: {card.hp}
              </span>
            )}
          </div>

          {/* Back of Card */}
          <div 
            className="absolute inset-0"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <img 
              src={CARD_BACK_URL} 
              alt="Card Back"
              className="w-full h-auto rounded-md shadow-sm"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 