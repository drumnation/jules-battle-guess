import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Interface for the structure of a card from the search results
interface PokemonCardSearchResult {
  id: string;
  name: string;
  images: {
    small: string;
    large: string;
  };
  set: {
    name: string;
    series: string;
  };
  number: string; // Card number within the set
  rarity?: string; // Optional rarity
}

// Remove the empty details interface for now
// interface PokemonCardDetails extends PokemonCardSearchResult {
  // Add more fields if needed for the detail view, e.g.:
  // types?: string[];
  // hp?: string;
  // attacks?: any[]; 
// }

export function SearchPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<PokemonCardSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Use the search result type directly for selected card state
  const [selectedCard, setSelectedCard] = useState<PokemonCardSearchResult | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a Pokémon name to search.");
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      // --- Refine query construction ---
      let queryValue = '';
      const trimmedSearchTerm = searchTerm.trim();
      if (trimmedSearchTerm.includes(' ')) {
        // Use quotes for multi-word search terms
        queryValue = `name:"${trimmedSearchTerm}"`;
      } else {
        // Use wildcard for single-word search terms
        queryValue = `name:${trimmedSearchTerm}*`;
      }
      // URL-encode the query value
      const encodedQueryValue = encodeURIComponent(queryValue);
      const apiUrl = `https://api.pokemontcg.io/v2/cards?q=${encodedQueryValue}`;
      // --- End query refinement ---
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data && Array.isArray(data.data) && data.data.length > 0) {
        setSearchResults(data.data);
      } else if (data && Array.isArray(data.data) && data.data.length === 0) {
        setError(`No cards found matching "${searchTerm}".`);
      } else {
        throw new Error('Invalid API response structure.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to search cards: ${err.message}`);
      } else {
        setError('An unknown error occurred during search');
      }
      console.error("Error searching Pokémon cards:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Fetch details for a specific card when its image is clicked
  const fetchCardDetails = async (cardId: string) => {
    setIsDetailLoading(true);
    setDetailError(null);
    setSelectedCard(null); // Clear previous selection
    try {
      const response = await fetch(`https://api.pokemontcg.io/v2/cards/${cardId}`);
      if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
       if (data && data.data) {
         // Use the search result type here too
         setSelectedCard(data.data as PokemonCardSearchResult); 
       } else {
         throw new Error('Could not find card details in API response.');
       }
    } catch (err) {
       if (err instanceof Error) {
         setDetailError(`Failed to fetch card details: ${err.message}`);
       } else {
         setDetailError('An unknown error occurred fetching details');
       }
      console.error("Error fetching card details:", err);
    } finally {
       setIsDetailLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 pt-10 bg-gray-100 dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">Search Pokémon Cards</h1>
      
      <div className="flex w-full max-w-md mb-6">
        <Input 
          type="search" 
          placeholder="Enter Pokémon name (e.g., Pikachu)" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="mr-2"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {/* Results Area */} 
      <div className="w-full max-w-5xl flex-grow">
        {error && <p className="text-red-500 text-center mb-4">Error: {error}</p>}
        {isLoading && <p className="text-gray-500 dark:text-gray-400 text-center">Loading search results...</p>}
        {!isLoading && searchResults.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {searchResults.map((card) => (
              <div key={card.id} className="flex flex-col items-center">
                <img 
                  src={card.images.small} 
                  alt={card.name}
                  className="w-full h-auto rounded-lg shadow-md mb-1 hover:scale-105 transition-transform duration-200 cursor-pointer"
                  onClick={() => fetchCardDetails(card.id)} // Fetch details on click
                  title={`Click to view details: ${card.name}`}
                />
              </div>
            ))}
          </div>
        )}
         {!isLoading && !error && searchResults.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center">Enter a name above and click Search.</p>
        )}
      </div>

      {/* Card Detail Dialog */} 
      <Dialog open={!!selectedCard || isDetailLoading} onOpenChange={(isOpen) => { 
          if (!isOpen) {
            setSelectedCard(null); 
            setDetailError(null);
          }
        }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedCard?.name ?? 'Loading...'}</DialogTitle>
             {selectedCard && <DialogDescription>
               {selectedCard.set.name} - {selectedCard.number} {selectedCard.rarity ? `(${selectedCard.rarity})` : ''}
             </DialogDescription>}
          </DialogHeader>
          <div className="py-4">
            {isDetailLoading && <p>Loading details...</p>}
            {detailError && <p className="text-red-500">Error: {detailError}</p>}
            {selectedCard && !isDetailLoading && !detailError && (
              <div>
                {/* Display Larger Image */}
                <img src={selectedCard.images.large} alt={`${selectedCard.name} large`} className="w-full h-auto rounded-md mb-4"/>
                {/* Display Key Details */}
                <p><strong>ID:</strong> {selectedCard.id}</p>
                <p><strong>Set:</strong> {selectedCard.set.series} - {selectedCard.set.name}</p>
                <p><strong>Number:</strong> {selectedCard.number}</p>
                {selectedCard.rarity && <p><strong>Rarity:</strong> {selectedCard.rarity}</p>}
                {/* Add more details here as needed */}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCard(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
} 