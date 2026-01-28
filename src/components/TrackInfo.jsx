import React from 'react';
import { 
  ThumbsDown, 
  Heart, 
  Zap
} from 'lucide-react';

const TrackInfo = ({ 
  track,
  isLiked,
  onLike,
  onDislike,
  streak = 0,
  position = 'left' // 'left' for track details, 'right' for actions
}) => {
  if (!track) return null;

  // Left side - Track details
  if (position === 'left') {
    return (
      <div className="flex items-center gap-4">
        {/* Album art / Track visual */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-wave-accent/30 to-wave-purple/30"
          />
          <img
            src={track.artwork || '/default-artwork.svg'}
            alt={track.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          {/* Fallback gradient art */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 -z-10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-wave-accent animate-pulse" />
            </div>
          </div>
        </div>

        {/* Track info */}
        <div className="flex flex-col gap-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-white max-w-[250px] sm:max-w-[350px] leading-tight">
            {track.title}
          </h3>
          <p className="text-xs sm:text-sm text-white/50 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-wave-accent/50" />
            {track.neuralEffect || 'Low Neural Effect'}
          </p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-1">
            {track.tags?.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full glass text-white/70"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Right side - Actions
  return (
    <div className="flex items-center justify-end gap-2 sm:gap-4">
      {/* Like/Dislike buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={onDislike}
          className="p-2 rounded-full text-white/40 hover:text-white/70 hover:bg-white/10 transition-all"
          aria-label="Dislike"
        >
          <ThumbsDown className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={onLike}
          className={`p-2 rounded-full transition-all ${
            isLiked 
              ? 'text-pink-500 bg-pink-500/20' 
              : 'text-white/40 hover:text-white/70 hover:bg-white/10'
          }`}
          aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Streak indicator */}
      {streak > 0 && (
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-medium text-white/70">
            {streak} day{streak !== 1 ? 's' : ''} streak
          </span>
        </div>
      )}
    </div>
  );
};

export default TrackInfo;
