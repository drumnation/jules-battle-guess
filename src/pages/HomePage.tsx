import { Button } from "@/components/ui/button"
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from "../store/gameStore";

// Remove unused interface
// interface PokemonCard {
//   id: string;
//   name: string;
//   number: string;
//   images: {
//     small: string;
//     large: string;
//   };
// }

// This is the content previously in App.tsx
export function HomePage() {
  const [cardImageUrl, setCardImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setPhase = useGameStore((state) => state.setPhase);

  useEffect(() => {
    // Update to fetch the specific Rainbow Rare card by ID
    const fetchRainbowCharizard = async () => { 
      setIsLoading(true);
      setError(null);
      // const cardName = "Charizard VMAX";
      // const setId = "swsh45"; // Shining Fates set ID
      // const cardNumber = "SV107"; // Shiny Vault card number
      const cardId = "swsh35-74"; // Champion's Path Rainbow Rare Charizard VMAX ID

      try {
        // const query = `q=name:"${cardName}" set.id:${setId}`; // Remove search query
        // const response = await fetch(`https://api.pokemontcg.io/v2/cards?${query}`); // Remove search fetch
        const response = await fetch(`https://api.pokemontcg.io/v2/cards/${cardId}`); // Fetch by ID
        
        if (!response.ok) {
           if (response.status === 404) {
             throw new Error(`Card with ID "${cardId}" not found (404).`);
           } else {
             throw new Error(`HTTP error! status: ${response.status}`);
           }
        }
        const data = await response.json();

        // Fetching by ID, structure should be data.data
        if (data && data.data && data.data.images && data.data.images.large) {
          // const targetCard = data.data.find((card: PokemonCard) => card.number === cardNumber); // Remove filtering logic
          // if (targetCard && targetCard.images && targetCard.images.large) { // Remove filtering logic
          setCardImageUrl(data.data.images.large);
          // } else {
             // setError(`Card number "${cardNumber}" not found within the search results for ${cardName} in set ${setId}.`);
             // setCardImageUrl(null); 
          // }
        // } else if (data && Array.isArray(data.data) && data.data.length === 0) { // Remove search-specific check
           // setError(`No cards found matching name "${cardName}" in set ${setId}.`);
           // setCardImageUrl(null); 
        } else {
          // setError('Invalid API response structure during search.'); // Change error message
          setError('Could not find card image in API response.');
          setCardImageUrl(null);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(`Failed to fetch card: ${err.message}`);
        } else {
          setError('An unknown error occurred');
        }
        setCardImageUrl(null);
        console.error("Error fetching Pokémon card:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRainbowCharizard(); // Call the updated function
  }, []);

  // Function to handle starting the game
  const handleStartGame = () => {
    setPhase('nameInput'); // Set initial game phase in store
    navigate('/game'); // Navigate to the game page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100">Welcome to Battle Guess!</h1>
      <p className="mb-8 text-lg text-center text-gray-600 dark:text-gray-300">Can you guess the Pokémon?</p>

      <div className="mb-8 h-96 flex items-center justify-center">
        {isLoading && <p className="text-gray-500 dark:text-gray-400">Loading Card...</p>}
        {/* Display error OR image. If error, don't show broken image link */} 
        {error && !isLoading && <p className="text-red-500">Error: {error}</p>}
        {!isLoading && !error && cardImageUrl && (
          <img 
            src={cardImageUrl} 
            alt="Charizard VMAX Rainbow Rare (Champion's Path)" 
            className="max-w-xs sm:max-w-sm h-auto rounded-lg shadow-lg"
          />
        )}
        {/* Add case where loading is done, no error, but still no image (e.g., card number not found) */} 
        {!isLoading && !error && !cardImageUrl && (
           <p className="text-gray-500 dark:text-gray-400">Card image could not be loaded.</p>
        )}
      </div>

      <Button className="mt-8" onClick={handleStartGame}>Start New Game</Button>
    </div>
  );
} 