import React, { useState, useEffect } from 'react';
import { Globe, Music, Users, Play, Check } from 'lucide-react';

export default function SetupScreen({ songs, onStartGame }) {
  const [selectedLanguages, setSelectedLanguages] = useState(['Hebrew', 'English']);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [gameMode, setGameMode] = useState('single'); // 'single' or 'multi'
  const [playerNames, setPlayerNames] = useState(['שחקן 1', 'שחקן 2']);
  const [roundsCount, setRoundsCount] = useState(5);

  // Extract all unique languages and artists from the songs array
  const allLanguages = Array.from(new Set(songs.map((s) => s.language)));
  
  // Dynamic list of artists based on selected languages
  const availableArtists = Array.from(
    new Set(
      songs
        .filter((s) => selectedLanguages.includes(s.language))
        .map((s) => s.artist)
    )
  );

  // Automatically select all available artists when languages change
  useEffect(() => {
    setSelectedArtists(availableArtists);
  }, [selectedLanguages, songs]);

  const toggleLanguage = (lang) => {
    if (selectedLanguages.includes(lang)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const toggleArtist = (artist) => {
    if (selectedArtists.includes(artist)) {
      setSelectedArtists(selectedArtists.filter((a) => a !== artist));
    } else {
      setSelectedArtists([...selectedArtists, artist]);
    }
  };

  const toggleSelectAllArtists = () => {
    if (selectedArtists.length === availableArtists.length) {
      setSelectedArtists([]);
    } else {
      setSelectedArtists(availableArtists);
    }
  };

  const handlePlayerNameChange = (index, value) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  const addPlayer = () => {
    if (playerNames.length < 6) {
      setPlayerNames([...playerNames, `שחקן ${playerNames.length + 1}`]);
    }
  };

  const removePlayer = () => {
    if (playerNames.length > 2) {
      setPlayerNames(playerNames.slice(0, -1));
    }
  };

  const handleStart = () => {
    // Filter songs based on configuration
    const filteredSongs = songs.filter(
      (s) =>
        selectedLanguages.includes(s.language) &&
        selectedArtists.includes(s.artist)
    );

    if (filteredSongs.length === 0) {
      alert('לא נמצאו שירים המתאימים לסינון שבחרת. אנא בחר/י עוד שפות או אמנים.');
      return;
    }

    onStartGame({
      languages: selectedLanguages,
      artists: selectedArtists,
      mode: gameMode,
      players: gameMode === 'single' ? ['שחקן 1'] : playerNames,
      rounds: roundsCount,
      filteredSongs,
    });
  };

  return (
    <div className="rtl">
      <div className="header">
        <h1 className="logo">RhymeTime</h1>
        <p className="subtitle">משחק ניחוש שירים לפי חרוזים</p>
      </div>

      {/* Languages */}
      <div className="glass-card">
        <h2 className="label-title">
          <Globe size={18} className="text-cyan-400" /> בחירת שפות
        </h2>
        <div className="options-grid">
          {allLanguages.map((lang) => (
            <div
              key={lang}
              onClick={() => toggleLanguage(lang)}
              className={`selectable-box ${selectedLanguages.includes(lang) ? 'active' : ''}`}
            >
              <span className="selectable-text">{lang === 'Hebrew' ? 'עברית' : 'אנגלית'}</span>
              {selectedLanguages.includes(lang) && <Check size={16} color="var(--neon-cyan)" />}
            </div>
          ))}
        </div>
      </div>

      {/* Artists / Bands */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 className="label-title" style={{ margin: 0 }}>
            <Music size={18} /> בחירת זמרים / להקות
          </h2>
          <button 
            onClick={toggleSelectAllArtists}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--neon-cyan)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            {selectedArtists.length === availableArtists.length ? 'הסר הכל' : 'בחר הכל'}
          </button>
        </div>
        
        <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.2rem' }}>
          {availableArtists.map((artist) => {
            const isSelected = selectedArtists.includes(artist);
            return (
              <div
                key={artist}
                onClick={() => toggleArtist(artist)}
                style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--neon-magenta)' : 'var(--glass-border)',
                  background: isSelected ? 'rgba(255, 0, 127, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  color: isSelected ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                {artist}
                {isSelected && <Check size={12} color="var(--neon-magenta)" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Game Mode */}
      <div className="glass-card">
        <h2 className="label-title">
          <Users size={18} /> מצב משחק
        </h2>
        <div className="options-grid" style={{ marginBottom: '1rem' }}>
          <div
            onClick={() => setGameMode('single')}
            className={`selectable-box ${gameMode === 'single' ? 'active' : ''}`}
          >
            <span className="selectable-text">שחקן יחיד</span>
          </div>
          <div
            onClick={() => setGameMode('multi')}
            className={`selectable-box ${gameMode === 'multi' ? 'active' : ''}`}
          >
            <span className="selectable-text">משחק קבוצתי</span>
          </div>
        </div>

        {gameMode === 'multi' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>שמות השחקנים:</label>
            {playerNames.map((name, idx) => (
              <input
                key={idx}
                type="text"
                value={name}
                onChange={(e) => handlePlayerNameChange(idx, e.target.value)}
                placeholder={`שחקן ${idx + 1}`}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  color: 'white',
                  fontSize: '0.9rem',
                  textAlign: 'right',
                  fontFamily: 'inherit'
                }}
              />
            ))}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                onClick={addPlayer} 
                className="btn btn-outline" 
                style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                disabled={playerNames.length >= 6}
              >
                + הוסף שחקן
              </button>
              <button 
                type="button" 
                onClick={removePlayer} 
                className="btn btn-outline" 
                style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                disabled={playerNames.length <= 2}
              >
                - הסר שחקן
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rounds Count */}
      <div className="glass-card">
        <label className="label-title">מספר סיבובים: {roundsCount}</label>
        <input 
          type="range" 
          min="3" 
          max="15" 
          value={roundsCount} 
          onChange={(e) => setRoundsCount(Number(e.target.value))}
          style={{
            width: '100%',
            accentColor: 'var(--neon-cyan)',
            background: 'var(--glass-bg)',
            height: '6px',
            borderRadius: '3px',
            outline: 'none'
          }}
        />
      </div>

      <button onClick={handleStart} className="btn btn-cyan">
        <Play size={18} /> התחל משחק
      </button>
    </div>
  );
}
