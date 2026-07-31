import React, { useState, useEffect } from 'react';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import ResultsScreen from './components/ResultsScreen';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Game screens: 'setup', 'game', 'results'
  const [screen, setScreen] = useState('setup');
  
  const [gameState, setGameState] = useState({
    filteredSongs: [],
    players: [],
    rounds: 5,
    currentRound: 1,
    currentPlayerIndex: 0,
    scores: {},
    history: []
  });

  // Fetch songs list from manifest file in public directory
  useEffect(() => {
    fetch('/songs/songs_manifest.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load songs manifest');
        }
        return res.json();
      })
      .then((data) => {
        setSongs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('שגיאה בטעינת קובץ השירים. ודא כי הוא קיים בתיקיית public/songs/');
        setLoading(false);
      });
  }, []);

  const handleStartGame = (config) => {
    const initialScores = {};
    config.players.forEach((p) => {
      initialScores[p] = 0;
    });

    // Create deck of unique song-rhyme pairs
    const deck = [];
    config.filteredSongs.forEach((song) => {
      if (song.rhymes && song.rhymes.length > 0) {
        song.rhymes.forEach((rhyme, idx) => {
          deck.push({
            song,
            rhyme,
            rhymeIndex: idx
          });
        });
      }
    });

    // Shuffle the deck
    const shuffledDeck = [...deck].sort(() => 0.5 - Math.random());

    // Calculate maximum possible rounds without repeating any rhyme
    const maxRounds = Math.max(1, Math.floor(shuffledDeck.length / config.players.length));
    const finalRounds = Math.min(config.rounds, maxRounds);

    setGameState({
      filteredSongs: config.filteredSongs,
      players: config.players,
      rounds: finalRounds,
      currentRound: 1,
      currentPlayerIndex: 0,
      scores: initialScores,
      history: [],
      deck: shuffledDeck
    });
    setScreen('game');
  };

  const handleAnswerWithDetails = (isCorrect, points, songTitle, songArtist) => {
    const activePlayer = gameState.players[gameState.currentPlayerIndex];
    
    // Update score
    const newScores = { ...gameState.scores };
    if (isCorrect) {
      newScores[activePlayer] = (newScores[activePlayer] || 0) + points;
    }

    // Save history item
    const historyItem = {
      round: gameState.currentRound,
      player: activePlayer,
      songTitle,
      songArtist,
      isCorrect,
      points
    };

    const newHistory = [...gameState.history, historyItem];

    // Determine next turn / round
    let nextPlayerIdx = gameState.currentPlayerIndex + 1;
    let nextRound = gameState.currentRound;

    if (nextPlayerIdx >= gameState.players.length) {
      nextPlayerIdx = 0;
      nextRound += 1;
    }

    // Check if game is over
    if (nextRound > gameState.rounds) {
      setGameState((prev) => ({
        ...prev,
        scores: newScores,
        history: newHistory
      }));
      setScreen('results');
    } else {
      setGameState((prev) => ({
        ...prev,
        scores: newScores,
        history: newHistory,
        currentPlayerIndex: nextPlayerIdx,
        currentRound: nextRound
      }));
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={40} color="var(--neon-cyan)" />
        <p>טוען את מילות השירים...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', borderColor: 'var(--neon-magenta)', padding: '2rem', margin: '2rem auto', maxWidth: '400px' }}>
        <h2 style={{ color: 'var(--neon-magenta)', marginBottom: '1rem' }}>אופס!</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {screen === 'setup' && (
        <SetupScreen songs={songs} onStartGame={handleStartGame} />
      )}
      
      {screen === 'game' && (
        <GameScreen
          gameState={gameState}
          allSongs={songs}
          currentQuestion={
            gameState.deck 
              ? gameState.deck[(gameState.currentRound - 1) * gameState.players.length + gameState.currentPlayerIndex] 
              : null
          }
          onAnswer={handleAnswerWithDetails}
          onGameOver={() => setScreen('results')}
        />
      )}

      {screen === 'results' && (
        <ResultsScreen gameState={gameState} onRestart={() => setScreen('setup')} />
      )}
    </div>
  );
}
