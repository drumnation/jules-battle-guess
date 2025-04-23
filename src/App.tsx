import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { GamePage } from './pages/GamePage';
import { MusicPlayer } from './components/ui/MusicPlayer';

// List of music tracks relative to the public folder
const musicTracks = [
  '/Battle Guess!.mp3',
  '/Battle Guess!2.mp3',
  '/Pokémon Battle Guess Game 2.mp3',
  '/Pokémon Battle Guess Game.mp3'
];

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      
      {/* Combined Header/Navigation - Fixed at the top with Red Gradient */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-gradient-to-r from-red-800 to-red-700 shadow-md">
        <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 md:px-6">
          {/* Left side: Title and Nav Links */}
          <div className="flex items-center gap-6 md:gap-10">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              {/* Title uses primary-foreground (white) for contrast */}
              <span className="font-bold sm:inline-block text-primary-foreground">Jules Pokémon Battle Guess</span> 
            </Link>
            {/* Nav links use primary-foreground (white) for contrast */}
            <nav className="hidden gap-6 md:flex">
              <Link to="/" className="text-sm font-medium text-primary-foreground/90 transition-colors hover:text-primary-foreground">
                Home
              </Link>
              <Link to="/search" className="text-sm font-medium text-primary-foreground/90 transition-colors hover:text-primary-foreground">
                Search Cards
              </Link>
              {/* <Link to="/game" className="text-sm font-medium text-primary-foreground/90 transition-colors hover:text-primary-foreground">Game</Link> */} 
            </nav>
          </div>
          
          {/* Right side: Music Player */}
          {/* Adjust MusicPlayer background/text if needed */}
          <div className="flex items-center gap-4">
             <MusicPlayer tracks={musicTracks} />
             {/* TODO: Add mobile menu button here */} 
          </div>
        </div>
      </header>

      {/* Main Content Area - Takes remaining space and scrolls */} 
      <main className="flex-1 container mx-auto px-4 py-8 overflow-auto">
        {/* Removed the old nav bar from here */}
        
        {/* Route Definitions */} 
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/game" element={<GamePage />} />
        </Routes>
      </main>

       {/* Simple Footer */}
       <footer className="p-4 text-center text-sm text-gray-500 border-t border-border/40">
          Created with Pokémon TCG API & React
       </footer>
    </div>
  )
}

export default App
