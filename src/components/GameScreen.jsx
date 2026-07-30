import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Star, Clock, AlertCircle, Check } from 'lucide-react';

export default function GameScreen({ 
  gameState, 
  allSongs, // Full list to grab distractors if filtered is too small
  onAnswer, 
  onGameOver 
}) {
  const { 
    filteredSongs, 
    players, 
    rounds, 
    currentRound, 
    currentPlayerIndex, 
    scores 
  } = gameState;

  const [currentSong, setCurrentSong] = useState(null);
  const [currentRhyme, setCurrentRhyme] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintText, setHintText] = useState('');
  
  const timerRef = useRef(null);

  const activePlayer = players[currentPlayerIndex];

  // Initialize a round
  useEffect(() => {
    startRound();
    return () => clearInterval(timerRef.current);
  }, [currentRound, currentPlayerIndex]);

  // Handle countdown
  useEffect(() => {
    if (timeLeft <= 0 && !answerRevealed) {
      handleTimeout();
    }
  }, [timeLeft, answerRevealed]);

  const startRound = () => {
    // 1. Pick a random song from the filtered list
    const randomSong = filteredSongs[Math.floor(Math.random() * filteredSongs.length)];
    setCurrentSong(randomSong);

    // 2. Pick a random rhyme pair from the song
    if (randomSong && randomSong.rhymes && randomSong.rhymes.length > 0) {
      const rhymePair = randomSong.rhymes[0]; // First rhyme pair
      setCurrentRhyme(rhymePair);
      
      // Prep second rhyme pair as a potential hint
      if (randomSong.rhymes.length > 1) {
        const secondRhyme = randomSong.rhymes[1];
        setHintText(`רמז - חרוז נוסף: ${secondRhyme[0]} ↔ ${secondRhyme[1]}`);
      } else {
        setHintText(`רמז: השפה היא ${randomSong.language === 'Hebrew' ? 'עברית' : 'אנגלית'}`);
      }
    }

    // 3. Generate 4 options (1 correct + 3 distractors)
    const optionsList = [randomSong];
    
    // Pool of potential distractors: first try filtered, then all songs
    let distractorPool = filteredSongs.filter((s) => s.id !== randomSong.id);
    if (distractorPool.length < 3) {
      distractorPool = allSongs.filter((s) => s.id !== randomSong.id);
    }

    // Shuffle and pick 3 unique distractors
    const shuffledPool = [...distractorPool].sort(() => 0.5 - Math.random());
    for (let i = 0; i < Math.min(3, shuffledPool.length); i++) {
      optionsList.push(shuffledPool[i]);
    }

    // If we still don't have 4 (e.g. very few songs total), pad with placeholders
    while (optionsList.length < 4) {
      optionsList.push({
        id: `placeholder_${optionsList.length}`,
        title: `שיר לדוגמה ${optionsList.length}`,
        artist: 'זמר פלוני'
      });
    }

    // Shuffle the final 4 options
    setOptions(optionsList.sort(() => 0.5 - Math.random()));
    
    // Reset state
    setSelectedOptionId(null);
    setAnswerRevealed(false);
    setHintUsed(false);
    setTimeLeft(20);

    // Start Timer
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  };

  const handleTimeout = () => {
    clearInterval(timerRef.current);
    setAnswerRevealed(true);
    // Timeout gives 0 points
    setTimeout(() => {
      moveToNext(false, 0);
    }, 2500);
  };

  const handleOptionClick = (optionId) => {
    if (answerRevealed) return; // Prevent multiple clicks

    clearInterval(timerRef.current);
    setSelectedOptionId(optionId);
    setAnswerRevealed(true);

    const isCorrect = optionId === currentSong.id;
    // Score formula: Base 100 points + time left bonus (max 100) - hint penalty (50 points)
    const timeBonus = timeLeft * 5;
    const baseScore = isCorrect ? 100 : 0;
    const hintPenalty = hintUsed ? 40 : 0;
    const pointsEarned = isCorrect ? Math.max(20, baseScore + timeBonus - hintPenalty) : 0;

    setTimeout(() => {
      moveToNext(isCorrect, pointsEarned);
    }, 2000);
  };

  const moveToNext = (isCorrect, points) => {
    onAnswer(isCorrect, points, currentSong.title, currentSong.artist);
  };

  const useHint = () => {
    setHintUsed(true);
  };

  if (!currentSong) return null;

  // Determine direction based on song language
  const isHebrewSong = currentSong.language === 'Hebrew';
  const textDirection = isHebrewSong ? 'rtl' : 'ltr';

  return (
    <div className="rtl">
      {/* Top Header info */}
      <div className="game-info-bar">
        <span className="info-item">
          סיבוב {currentRound} מתוך {rounds}
        </span>
        <span className="info-item">
          <Clock size={16} style={{ color: timeLeft < 7 ? 'var(--neon-magenta)' : 'var(--neon-cyan)' }} />
          <span style={{ fontWeight: 'bold', color: timeLeft < 7 ? 'var(--neon-magenta)' : 'white' }}>
            {timeLeft}ש'
          </span>
        </span>
      </div>

      {/* Turn indicator for Multiplayer */}
      {players.length > 1 && (
        <div className="players-status">
          {players.map((p, idx) => (
            <div 
              key={p} 
              className={`player-bubble ${idx === currentPlayerIndex ? 'active-player' : ''}`}
            >
              <div style={{ fontWeight: 'bold' }}>{p}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)' }}>{scores[p] || 0} נק'</div>
            </div>
          ))}
        </div>
      )}

      {/* Timer Progress Bar */}
      <div className="progress-bar-container">
        <div 
          className="progress-bar" 
          style={{ 
            width: `${(timeLeft / 20) * 100}%`,
            background: timeLeft < 7 ? 'var(--neon-magenta)' : 'linear-gradient(90deg, var(--neon-cyan), var(--neon-purple))'
          }}
        />
      </div>

      {/* Active turn badge */}
      {players.length > 1 && (
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span className="badge" style={{ background: 'rgba(157, 78, 221, 0.2)', border: '1px solid var(--neon-purple)', padding: '0.4rem 1rem' }}>
            תורו של: <strong>{activePlayer}</strong>
          </span>
        </div>
      )}

      {/* Rhyme Words Box */}
      <div className="glass-card" style={{ padding: '2rem 1rem', position: 'relative' }}>
        <div className="rhyme-words-container" style={{ padding: 0, background: 'none', marginBottom: 0 }}>
          <span className="rhyme-word">{currentRhyme[0] || '...'}</span>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>↔</span>
          <span className="rhyme-word">{currentRhyme[1] || '...'}</span>
        </div>
      </div>

      {/* Hint Area */}
      {hintUsed ? (
        <div className="hint-box" style={{ direction: textDirection }}>
          {hintText}
        </div>
      ) : (
        <button 
          onClick={useHint} 
          className="btn btn-outline" 
          style={{ padding: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem', width: 'auto', margin: '0 auto 1.5rem auto' }}
        >
          <HelpCircle size={14} /> קבלת רמז (מפחית ניקוד)
        </button>
      )}

      {/* MCQ options (direction adjusted per selected song language to support RTL/LTR) */}
      <div className="mcq-container">
        {options.map((opt) => {
          const isCorrect = opt.id === currentSong.id;
          const isSelected = opt.id === selectedOptionId;
          
          let className = 'mcq-option';
          if (answerRevealed) {
            className += ' disabled';
            if (isCorrect) className += ' correct';
            if (isSelected && !isCorrect) className += ' incorrect';
          }

          return (
            <button
              key={opt.id}
              onClick={() => handleOptionClick(opt.id)}
              disabled={answerRevealed}
              className={className}
              style={{ direction: textDirection }}
            >
              <span>{opt.title} - <small style={{ opacity: 0.8 }}>{opt.artist}</small></span>
              {answerRevealed && isCorrect && <Check size={18} />}
              {answerRevealed && isSelected && !isCorrect && <span style={{ fontSize: '1.2rem' }}>×</span>}
            </button>
          );
        })}
      </div>

      {/* Skip / End Game */}
      <button 
        onClick={onGameOver} 
        className="btn btn-outline" 
        style={{ marginTop: '1rem', border: '1px dashed var(--glass-border)' }}
      >
        סיום המשחק
      </button>
    </div>
  );
}
