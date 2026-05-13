import { useState, useEffect, useCallback } from 'react';
import { generatePalette } from './palette';

interface SavedPalette {
  id: string;
  colors: string[];
  savedAt: number;
}

const STORAGE_KEY = 'cpg-favorites';

function loadFavorites(): SavedPalette[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveFavorites(favs: SavedPalette[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
}

function contrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#000000' : '#ffffff';
}

function CopyToast({ message }: { message: string }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        background: '#000',
        color: '#fff',
        fontSize: 13,
        padding: '8px 18px',
        borderRadius: 999,
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      {message}
    </div>
  );
}

function SwatchBar({
  color,
  isFavorited,
  onFavorite,
  onCopy,
}: {
  color: string;
  isFavorited: boolean;
  onFavorite: () => void;
  onCopy: () => void;
}) {
  const fg = contrastColor(color);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'relative',
        backgroundColor: color,
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      onClick={onCopy}
    >
      {/* Heart button */}
      <button
        style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          minWidth: 44,
          minHeight: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          borderRadius: '50%',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onFavorite();
        }}
        aria-label={isFavorited ? 'Remove from favorites' : 'Save palette'}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill={isFavorited ? fg : 'none'}
          stroke={fg}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: isFavorited ? 1 : 0.55, transition: 'opacity 0.15s, fill 0.15s' }}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* Hex label */}
      <div
        style={{
          marginBottom: 20,
          padding: '4px 6px',
          color: fg,
          opacity: 0.8,
          fontSize: 11,
          fontFamily: 'ui-monospace, monospace',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          transform: 'rotate(180deg)',
        }}
      >
        {color}
      </div>
    </div>
  );
}

function MiniPalette({ colors }: { colors: string[] }) {
  return (
    <div style={{ display: 'flex', height: 32, borderRadius: 6, overflow: 'hidden', width: '100%' }}>
      {colors.map((c, i) => (
        <div key={i} style={{ flex: 1, backgroundColor: c }} />
      ))}
    </div>
  );
}

function SavedDrawer({
  favorites,
  onClose,
  onRemove,
  onLoad,
}: {
  favorites: SavedPalette[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onLoad: (colors: string[]) => void;
}) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex', flexDirection: 'column' }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} />

      {/* Drawer panel */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          background: '#111',
          width: '100%',
          maxHeight: '70vh',
          overflowY: 'auto',
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>Saved Palettes</span>
          <button
            style={{
              minWidth: 44,
              minHeight: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.5)',
              padding: 0,
            }}
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {favorites.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            No saved palettes yet — tap the ♥ on any swatch.
          </div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {favorites.map((fav) => (
              <li
                key={fav.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <button
                  style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={() => { onLoad(fav.colors); onClose(); }}
                >
                  <MiniPalette colors={fav.colors} />
                  <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {fav.colors.map((c, i) => (
                      <span key={i} style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>{c}</span>
                    ))}
                  </div>
                </button>
                <button
                  style={{
                    flexShrink: 0,
                    minWidth: 44,
                    minHeight: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.25)',
                    padding: 0,
                  }}
                  onClick={() => onRemove(fav.id)}
                  aria-label="Delete"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [colors, setColors] = useState<string[]>(() => generatePalette());
  const [favorites, setFavorites] = useState<SavedPalette[]>(loadFavorites);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const currentPaletteId = colors.join(',');
  const isCurrentFavorited = favorites.some((f) => f.id === currentPaletteId);

  const generate = useCallback(() => {
    setColors(generatePalette());
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [generate]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  const handleCopy = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setToast(`Copied ${color}`);
    } catch {
      setToast(color);
    }
  };

  const handleFavorite = () => {
    if (isCurrentFavorited) {
      const updated = favorites.filter((f) => f.id !== currentPaletteId);
      setFavorites(updated);
      saveFavorites(updated);
    } else {
      const newFav: SavedPalette = { id: currentPaletteId, colors: [...colors], savedAt: Date.now() };
      const updated = [newFav, ...favorites];
      setFavorites(updated);
      saveFavorites(updated);
      setToast('Palette saved!');
    }
  };

  const handleRemoveFavorite = (id: string) => {
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    saveFavorites(updated);
  };

  const handleLoadFavorite = (loaded: string[]) => {
    setColors(loaded);
  };

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: '#000', overflow: 'hidden' }}>
      {toast && <CopyToast message={toast} />}

      {drawerOpen && (
        <SavedDrawer
          favorites={favorites}
          onClose={() => setDrawerOpen(false)}
          onRemove={handleRemoveFavorite}
          onLoad={handleLoadFavorite}
        />
      )}

      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          flexShrink: 0,
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Palette
        </span>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            minHeight: 44,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 13,
            padding: '0 4px',
          }}
          onClick={() => setDrawerOpen(true)}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={favorites.length > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>Saved{favorites.length > 0 ? ` (${favorites.length})` : ''}</span>
        </button>
      </div>

      {/* Swatches row */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {colors.map((color, i) => (
          <SwatchBar
            key={i}
            color={color}
            isFavorited={isCurrentFavorited}
            onFavorite={handleFavorite}
            onCopy={() => handleCopy(color)}
          />
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{ flexShrink: 0, padding: '12px 16px 20px' }}>
        <button
          onClick={generate}
          style={{
            width: '100%',
            minHeight: 52,
            background: '#fff',
            color: '#000',
            border: 'none',
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            display: 'block',
          }}
        >
          Generate
        </button>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.18)', fontSize: 11, marginTop: 8, fontFamily: 'monospace' }}>
          tap swatch to copy · space to regenerate
        </p>
      </div>
    </div>
  );
}
