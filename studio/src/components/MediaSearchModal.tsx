import React, { useState } from 'react';
import { X, Image as ImageIcon, Search, Check, Sparkles, Globe } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentBgUrl?: string;
  onSelectImage: (imageUrl: string) => void;
}

const STOCK_PHOTOS = [
  {
    title: 'Peddie School Campus Arch',
    category: 'Peddie',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Andover Academy Great Lawn',
    category: 'Andover',
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Exeter Harkness Classroom Table',
    category: 'Exeter',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Graduation Ceremony Confetti',
    category: 'Graduation',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Peddie Swimming & Aquatic Center',
    category: 'Sports',
    url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Late Night SSAT Study Desk',
    category: 'Study',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function MediaSearchModal({ isOpen, onClose, currentBgUrl, onSelectImage }: Props) {
  const [customUrl, setCustomUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    onSelectImage(customUrl);
    onClose();
  };

  const filteredPhotos = STOCK_PHOTOS.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-sans">
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Web Image & High-Res Campus Photo Library
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Custom Web Image URL Bar */}
        <form onSubmit={handleCustomUrlSubmit} className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-400 uppercase block">Paste Direct Web Image URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or any photo URL"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button type="submit" className="studio-btn-primary px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap">
              Use Photo
            </button>
          </div>
        </form>

        {/* Stock Campus Photos Gallery */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-slate-400 uppercase">High-Res Campus & Study Presets</label>
            <div className="relative w-48">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter photos..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1 px-2.5 pl-7 text-[11px] text-white focus:outline-none"
              />
              <Search className="w-3 h-3 text-slate-500 absolute left-2 top-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
            {filteredPhotos.map((photo, idx) => {
              const isSelected = currentBgUrl === photo.url;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectImage(photo.url);
                    onClose();
                  }}
                  className={`group relative rounded-xl overflow-hidden aspect-video border text-left transition shadow-md ${
                    isSelected ? 'border-indigo-500 ring-2 ring-indigo-500' : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2 flex flex-col justify-between">
                    <span className="self-end px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/60 text-slate-300">
                      {photo.category}
                    </span>
                    <span className="text-[10px] font-bold text-white leading-tight drop-shadow-md">
                      {photo.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
