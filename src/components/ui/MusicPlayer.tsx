import React, { useState, useRef, useEffect } from 'react';
import {
  FaPlay, 
  FaPause, 
  FaForward, 
  FaBackward, 
  FaVolumeUp, 
  FaVolumeMute,
  FaRandom // Icon for shuffle
} from 'react-icons/fa';

interface MusicPlayerProps {
  tracks: string[]; // Array of music file paths relative to public folder
}

export function MusicPlayer({ tracks }: MusicPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5); // Volume from 0.0 to 1.0
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    // Autoplay when track changes if already playing
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(error => console.error("Autoplay failed:", error));
    }
  }, [currentTrackIndex, isPlaying]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => console.error("Play failed:", error));
    }
    setIsPlaying(!isPlaying);
  };

  const playNextTrack = () => {
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * tracks.length);
      // Avoid playing the same track twice in a row during shuffle
      if (nextIndex === currentTrackIndex && tracks.length > 1) {
        nextIndex = (currentTrackIndex + 1) % tracks.length;
      }
    } else {
      nextIndex = (currentTrackIndex + 1) % tracks.length;
    }
    setCurrentTrackIndex(nextIndex);
  };

  const playPrevTrack = () => {
    let prevIndex;
    if (isShuffle) {
        prevIndex = Math.floor(Math.random() * tracks.length);
        if (prevIndex === currentTrackIndex && tracks.length > 1) {
            prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        }
    } else {
        prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    }
    setCurrentTrackIndex(prevIndex);
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
    if (audioRef.current) {
       audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume;
    }
  };

  const handleEnded = () => {
    playNextTrack(); // Autoplay next track when current one ends
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-200 dark:bg-gray-800 rounded shadow">
      <audio 
        ref={audioRef} 
        src={currentTrack} 
        onEnded={handleEnded} 
        onPlay={() => setIsPlaying(true)} 
        onPause={() => setIsPlaying(false)}
      />

      {/* Previous Track Button */}
      <button onClick={playPrevTrack} title="Previous Track" className="p-1 hover:bg-gray-300 dark:hover:bg-gray-700 rounded">
        <FaBackward className="text-gray-700 dark:text-gray-300" />
      </button>

      {/* Play/Pause Button */}
      <button onClick={togglePlayPause} title={isPlaying ? "Pause" : "Play"} className="p-1 hover:bg-gray-300 dark:hover:bg-gray-700 rounded">
        {isPlaying ? 
          <FaPause className="text-gray-700 dark:text-gray-300" /> : 
          <FaPlay className="text-gray-700 dark:text-gray-300" />
        }
      </button>

      {/* Next Track Button */}
      <button onClick={playNextTrack} title="Next Track" className="p-1 hover:bg-gray-300 dark:hover:bg-gray-700 rounded">
        <FaForward className="text-gray-700 dark:text-gray-300" />
      </button>

      {/* Shuffle Button */}
       <button 
         onClick={toggleShuffle} 
         title={isShuffle ? "Disable Shuffle" : "Enable Shuffle"} 
         className={`p-1 hover:bg-gray-300 dark:hover:bg-gray-700 rounded ${isShuffle ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}
       >
         <FaRandom />
       </button>

      {/* Mute Button */}
      <button onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"} className="p-1 hover:bg-gray-300 dark:hover:bg-gray-700 rounded ml-2">
        {isMuted ? 
          <FaVolumeMute className="text-red-500" /> : 
          <FaVolumeUp className="text-gray-700 dark:text-gray-300" />
        }
      </button>

      {/* Volume Slider */}
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={isMuted ? 0 : volume}
        onChange={handleVolumeChange}
        className="w-20 h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
        title="Volume"
      />
    </div>
  );
} 