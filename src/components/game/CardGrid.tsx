import { PokemonCard } from "../../store/useGameStore";
import { motion } from "framer-motion";

// Placeholder URL for a generic Pokemon card back
const CARD_BACK_URL = "https://images.pokemontcg.io/dp1/123_hires.png"; // Example: Dialga card back (often used as generic)

interface CardGridProps {
  cards: PokemonCard[];
  onSelectCard: (card: PokemonCard, index: number) => void;
  disabled?: boolean; // Optional: To disable interaction (e.g., for P2 while P1 chooses)
  showBacks?: boolean; // New prop to show card backs
  player1SelectionIndex?: number | null;
  player2SelectionIndex?: number | null;
  player1Name?: string;
  player2Name?: string;
}

// Animation variants for the grid container and items
const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05 // Stagger effect delay between cards
    }
  }
};

const cardItemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 } // Add a little spring
  }
};

export function CardGrid({ 
  cards, 
  onSelectCard, 
  disabled = false, 
  showBacks = false, 
  player1SelectionIndex = null, 
  player2SelectionIndex = null,
  player1Name = 'Player 1',
  player2Name = 'Player 2'
}: CardGridProps) {
  return (
    <motion.div // Wrap grid in motion.div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-5 w-full max-w-4xl"
      variants={gridContainerVariants}
      initial="hidden"
      animate="visible" // Animate on mount
    >
      {cards.map((card, index) => {
        const isSelectedByP1 = index === player1SelectionIndex;
        const isSelectedByP2 = index === player2SelectionIndex;
        const isSelected = (isSelectedByP1 || isSelectedByP2) && showBacks;
        const isDisabled = disabled || isSelected;
        const selectorName = isSelectedByP1 ? player1Name : (isSelectedByP2 ? player2Name : null);

        return (
          <motion.div // Card item now also uses variants
            key={card.id}
            variants={cardItemVariants} // Use item variants
            className={`
              relative 
              flex flex-col items-center p-1 rounded-lg 
              transition-opacity duration-200 ease-in-out 
              ${isDisabled 
                ? 'cursor-not-allowed opacity-75 grayscale'
                : 'cursor-pointer hover:scale-105' // Re-add hover scale here
              }
              ${isSelected ? 'ring-4 ring-offset-2 ring-offset-gray-800' : ''} 
              ${isSelectedByP1 && showBacks ? 'ring-blue-400' : ''}
              ${isSelectedByP2 && showBacks ? 'ring-red-400' : ''}
            `}
            title={!isDisabled ? (showBacks ? `Select this card` : `Select ${card.name}`) : (isSelected ? `${selectorName} selected this` : (showBacks ? 'Card' : card.name))}
            onClick={() => !isDisabled && onSelectCard(card, index)}
          >
             {/* Added motion.div wrapper for hover/tap separate from layout animation */}
             <motion.div 
               className="w-full"
               whileHover={!isDisabled ? { scale: 1.05 } : {}}
               whileTap={!isDisabled ? { scale: 0.95 } : {}}
             >
                {showBacks ? (
                    <img 
                      src={CARD_BACK_URL} 
                      alt="Card Back"
                      className="w-full h-auto rounded-md shadow-sm"
                    />
                ) : (
                    <>
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
                    </>
                )}
             </motion.div>
          </motion.div>
        );
      })}
    </motion.div>
  );
} 