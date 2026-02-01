import React, { useMemo, useState } from 'react';
import { Plus, Music4 } from 'lucide-react';

const extractYouTubeId = (value) => {
  const input = value.trim();
  if (!input) return null;

  // Raw ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

  // Try URL parsing
  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase();
    if (host.includes('youtu.be')) {
      return url.pathname.replace('/', '').slice(0, 11);
    }
    const vParam = url.searchParams.get('v');
    if (vParam) return vParam.slice(0, 11);
    if (url.pathname.includes('/embed/')) {
      const parts = url.pathname.split('/embed/');
      return parts[1]?.split('/')[0]?.slice(0, 11) || null;
    }
  } catch (e) {
    // Ignore URL parse errors
  }

  const match = input.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  return null;
};

const BinauralMixSection = ({ tracks = [], onAddTrack, onSelectTrack }) => {
  const [title, setTitle] = useState('');
  const [youtubeInput, setYoutubeInput] = useState('');
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => title.trim().length > 0 && youtubeInput.trim().length > 0, [title, youtubeInput]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const videoId = extractYouTubeId(youtubeInput);
    if (!videoId) {
      setError('Please enter a valid YouTube link or video ID.');
      return;
    }
    onAddTrack?.({
      title: title.trim(),
      youtubeId: videoId,
    });
    setTitle('');
    setYoutubeInput('');
  };

  return (
    <section className="w-full max-w-3xl mt-8">
      <div className="rounded-2xl glass p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-wave-accent/20 text-wave-accent">
            <Music4 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Binaural Mix</h3>
            <p className="text-xs text-white/50">Add your own binaural tracks (YouTube links or IDs)</p>
          </div>
        </div>

        {/* Track list */}
        <div className="grid gap-2 mb-4">
          {tracks.length === 0 ? (
            <div className="text-sm text-white/40">No binaural tracks yet. Add one below.</div>
          ) : (
            tracks.map((track, index) => (
              <button
                key={track.id || track.youtubeId || index}
                onClick={() => onSelectTrack?.(index)}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
              >
                <div className="flex flex-col">
                  <span className="text-sm text-white/90">{track.title}</span>
                  <span className="text-[10px] text-white/40">{track.youtubeId}</span>
                </div>
                <span className="text-[10px] text-wave-accent">Play</span>
              </button>
            ))
          )}
        </div>

        {/* Add form */}
        <form onSubmit={handleSubmit} className="grid gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Track title"
            className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-white text-sm focus:outline-none focus:border-wave-accent/50"
          />
          <input
            type="text"
            value={youtubeInput}
            onChange={(e) => setYoutubeInput(e.target.value)}
            placeholder="YouTube link or video ID"
            className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-white text-sm focus:outline-none focus:border-wave-accent/50"
          />
          {error && <div className="text-xs text-red-400">{error}</div>}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full px-3 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-wave-accent to-wave-purple text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add to Binaural Mix
          </button>
        </form>
      </div>
    </section>
  );
};

export default BinauralMixSection;