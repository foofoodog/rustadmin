import React from 'react';
import itemSpritesData from '../data/itemSprites.json';
import { Package } from 'lucide-react';

export interface ItemSpriteProps {
  shortname: string;
  size?: number; // Target display dimension in px (default: 72)
  className?: string;
  alt?: string;
}

interface SpriteData {
  tileSize: number;
  cols: number;
  rows: number;
  width: number;
  height: number;
  coords: Record<string, [number, number]>;
}

const spriteData = itemSpritesData as unknown as SpriteData;

export const ItemSprite: React.FC<ItemSpriteProps> = ({
  shortname,
  size = 72,
  className = '',
  alt
}) => {
  const coord = spriteData.coords[shortname];

  if (!coord) {
    const shortLabel = shortname.split('.').pop() || shortname.slice(0, 4);
    return (
      <div
        className={`rounded-lg bg-zinc-800/80 border border-zinc-700/60 flex flex-col items-center justify-center text-zinc-400 p-1 shrink-0 ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
        title={alt || shortname}
      >
        <Package className="text-rust-400/80 mb-0.5" style={{ width: `${Math.round(size * 0.4)}px`, height: `${Math.round(size * 0.4)}px` }} />
        <span className="text-[9px] font-mono font-medium text-zinc-400 uppercase truncate max-w-full text-center">
          {shortLabel}
        </span>
      </div>
    );
  }

  const [col, row] = coord;
  const bgWidth = spriteData.cols * size;
  const bgHeight = spriteData.rows * size;
  const bgX = -col * size;
  const bgY = -row * size;

  return (
    <div
      role="img"
      aria-label={alt || shortname}
      title={alt || shortname}
      className={`shrink-0 select-none pointer-events-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundImage: `url('${import.meta.env.BASE_URL}items-spritesheet.webp')`,
        backgroundPosition: `${bgX}px ${bgY}px`,
        backgroundSize: `${bgWidth}px ${bgHeight}px`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'auto'
      }}
    />
  );
};
