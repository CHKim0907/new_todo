'use client';
import { useEffect, useState } from 'react';

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
  y: number;
}

export function CompletedAnimation({ show }: { show: boolean }) {
  const [emojis, setEmojis] = useState<FloatingEmoji[]>([]);

  useEffect(() => {
    if (!show) return;

    const emojiList = ['🎉', '🎊', '⭐', '🚀', '💪', '✨', '🌟', '👏'];
    const newEmojis: FloatingEmoji[] = Array.from({ length: 8 }).map((_, i) => ({
      id: `${Date.now()}-${i}`,
      emoji: emojiList[i],
      x: Math.random() * 80 - 40,
      y: Math.random() * 100 + 50,
    }));

    setEmojis(newEmojis);

    const timer = setTimeout(() => {
      setEmojis([]);
    }, 2000);

    return () => clearTimeout(timer);
  }, [show]);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {emojis.map((item) => (
        <div
          key={item.id}
          className="fixed text-4xl animate-bounce"
          style={{
            left: `${50 + item.x}%`,
            top: `${50 + item.y}%`,
            animation: `float 2s ease-out forwards`,
          }}
        >
          {item.emoji}
        </div>
      ))}
      <style>{`
        @keyframes float {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-80px) scale(0.5);
          }
        }
      `}</style>
    </div>
  );
}
