/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingBag, Flame, Headphones, AudioLines } from 'lucide-react';
import { CartItem } from '../types';

interface HeaderProps {
  cart: CartItem[];
  onCartToggle: () => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cart,
  onCartToggle,
  activeSection,
  setActiveSection,
}) => {
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { id: 'hero', label: '3D Customizer' },
    { id: 'products', label: 'The Collection' },
    { id: 'acoustic', label: 'Acoustic Studio' },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-black/40 backdrop-blur-xl border-b border-white/10 text-white transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('hero')} 
          className="flex items-center gap-2 cursor-pointer group"
          id="brand-logo"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center transition-all group-hover:scale-105 shadow-md shadow-indigo-600/20">
            <AudioLines className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="font-sans font-extrabold text-base tracking-widest text-white uppercase block">
              Aura Sound
            </span>
            <span className="text-[9px] font-mono font-medium tracking-widest text-white/50 uppercase -mt-1 block">
              Acoustic Artistry
            </span>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8" id="main-navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`font-sans text-xs font-semibold uppercase tracking-widest transition-all relative py-1.5 ${
                activeSection === item.id
                  ? 'text-white'
                  : 'text-white/50 hover:text-indigo-400'
              }`}
            >
              {item.label}
              {activeSection === item.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-4">
          <button
            onClick={onCartToggle}
            className="group relative flex items-center justify-center w-10 h-10 rounded-full border border-white/10 hover:border-white/30 bg-white/5 backdrop-blur-md transition-all shadow-md text-white"
            id="open-cart-button"
            aria-label="Open Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
            
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-mono font-bold text-white border-2 border-[#050508] animate-bounce-subtle">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
