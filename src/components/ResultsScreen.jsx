import React from 'react';
import { Trophy, RotateCcw, Award, CheckCircle, XCircle } from 'lucide-react';

export default function ResultsScreen({ gameState, onRestart }) {
  const { players, scores, history } = gameState;

  // Find the winner(s)
  const sortedPlayers = [...players].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
  const topScore = scores[sortedPlayers[0]] || 0;
  const winners = sortedPlayers.filter(p => (scores[p] || 0) === topScore);

  return (
    <div className="rtl">
      <div className="header">
        <Trophy size={48} className="text-yellow-400" style={{ color: 'gold', margin: '0 auto 1rem auto', filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.4))' }} />
        <h1 className="logo">סיכום המשחק</h1>
        <p className="subtitle">כל הכבוד לכל המשתתפים!</p>
      </div>

      {/* Winners Banner */}
      <div className="glass-card" style={{ border: '1px solid var(--neon-cyan)', background: 'rgba(0, 240, 255, 0.05)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Award color="gold" />
          {winners.length > 1 ? 'תיקו בצמרת!' : 'המנצח הגדול!'}
        </h2>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--neon-cyan)', textShadow: '0 0 10px rgba(0,240,255,0.4)' }}>
          {winners.join(' & ')}
        </div>
        <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          עם {topScore} נקודות
        </div>
      </div>

      {/* Leaderboard for Multiplayer */}
      {players.length > 1 && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>טבלת המובילים</h3>
          <div className="scores-list">
            {sortedPlayers.map((player, idx) => (
              <div 
                key={player} 
                className={`score-row ${winners.includes(player) ? 'winner' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>#{idx + 1}</span>
                  <strong>{player}</strong>
                </div>
                <div style={{ fontWeight: 'bold' }}>{scores[player] || 0} נק'</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match History */}
      {history && history.length > 0 && (
        <div className="glass-card" style={{ maxHeight: '250px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>השירים בסיבוב הזה</h3>
          <div style={{ display: 'flex', flexDir: 'column', gap: '0.5rem', flexDirection: 'column' }}>
            {history.map((h, index) => (
              <div 
                key={index} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  fontSize: '0.85rem',
                  padding: '0.4rem 0',
                  borderBottom: index < history.length - 1 ? '1px solid var(--glass-border)' : 'none'
                }}
              >
                <div>
                  <strong>{h.songTitle}</strong> של <span>{h.songArtist}</span>
                  {players.length > 1 && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ניחש/ה: {h.player}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {h.isCorrect ? (
                    <span style={{ color: '#00ff7f', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <CheckCircle size={14} /> +{h.points}
                    </span>
                  ) : (
                    <span style={{ color: '#ff0055', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <XCircle size={14} /> 0
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={onRestart} className="btn btn-cyan" style={{ marginTop: '1.5rem' }}>
        <RotateCcw size={18} /> משחק חדש
      </button>
    </div>
  );
}
