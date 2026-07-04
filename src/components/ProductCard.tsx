/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../types';
import { Star, Check, Plus, Layers, Sliders, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, color: string) => void;
  // If we want to link card click to the 3D model customization
  onCustomize?: (colorHex: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onCustomize,
}) => {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [showSpecs, setShowSpecs] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    setIsAdding(true);
    onAddToCart(product, selectedColor.name);
    setTimeout(() => {
      setIsAdding(false);
    }, 1200);
  };

  const handleColorChange = (colorObj: typeof product.colors[0]) => {
    setSelectedColor(colorObj);
    if (product.isCustomizable && onCustomize) {
      onCustomize(colorObj.value3d);
    }
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 overflow-hidden flex flex-col group h-full text-white"
    >
      {/* Product Image Panel (Styled pure CSS abstract representation of premium audio) */}
      <div className="relative h-60 w-full bg-gradient-to-b from-white/5 to-white/10 border-b border-white/10 flex items-center justify-center p-6 overflow-hidden">
        {/* Decorative Grid or Abstract Ambient Circles */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        <div className="absolute w-40 h-40 rounded-full bg-indigo-500/20 blur-2xl group-hover:scale-110 transition-transform duration-700" />

        {/* Abstract Product Geometric Sculpture based on Category */}
        <div className="relative z-10 flex flex-col items-center">
          {product.category === 'headphones' && (
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Headband arch */}
              <div 
                className="absolute top-0 w-24 h-24 rounded-full border-[8px] border-b-transparent animate-pulse"
                style={{ borderColor: selectedColor.hex, borderBottomColor: 'transparent' }}
              />
              {/* Left Cup */}
              <div 
                className="absolute left-0 top-10 w-6 h-12 rounded-lg shadow-md transition-all duration-300"
                style={{ backgroundColor: selectedColor.hex }}
              />
              {/* Right Cup */}
              <div 
                className="absolute right-0 top-10 w-6 h-12 rounded-lg shadow-md transition-all duration-300"
                style={{ backgroundColor: selectedColor.hex }}
              />
              {/* Driver detailing lines */}
              <div className="absolute w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-mono text-[9px] font-bold text-white/80 backdrop-blur-xs">
                AURA
              </div>
            </div>
          )}

          {product.category === 'earbuds' && (
            <div className="relative w-28 h-24 flex items-center justify-center gap-6">
              {/* Left Bud */}
              <div className="relative w-8 h-10 rounded-full flex items-center justify-center shadow-md animate-bounce-subtle" style={{ backgroundColor: selectedColor.hex }}>
                <div className="w-3.5 h-3.5 rounded-full bg-white/35" />
              </div>
              {/* Right Bud */}
              <div className="relative w-8 h-10 rounded-full flex items-center justify-center shadow-md animate-bounce-subtle [animation-delay:1.5s]" style={{ backgroundColor: selectedColor.hex }}>
                <div className="w-3.5 h-3.5 rounded-full bg-white/35" />
              </div>
            </div>
          )}

          {product.category === 'accessories' && (
            <div className="relative w-24 h-28 flex items-center justify-center">
              {/* Minimalist Stand Column */}
              <div className="absolute bottom-0 w-16 h-1.5 rounded-full bg-white/20" />
              <div className="absolute bottom-1 w-2.5 h-24 bg-white/40" />
              <div 
                className="absolute top-2 w-12 h-5 rounded-t-full shadow-md"
                style={{ backgroundColor: selectedColor.hex }}
              />
            </div>
          )}
        </div>

        {/* Customizable Badge */}
        {product.isCustomizable && (
          <div className="absolute top-4 left-4 flex items-center gap-1 bg-indigo-600/80 backdrop-blur-md text-white text-[9px] font-mono font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border border-indigo-400/30 shadow-md">
            <Sparkles className="w-3 h-3 text-white animate-pulse" />
            3D Customizer Available
          </div>
        )}

        {/* Product Price Tag */}
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 shadow-md font-mono font-bold text-sm text-indigo-300">
          ${product.price}
        </div>
      </div>

      {/* Info Content Section */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="flex text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating)
                    ? 'fill-amber-500 text-amber-500'
                    : 'text-white/20'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-mono font-medium text-white/50">
            {product.rating} ({product.reviewsCount} reviews)
          </span>
        </div>

        <h3 className="font-sans font-bold text-lg text-white mb-1 leading-snug group-hover:text-indigo-400 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-xs text-indigo-300 font-mono font-semibold tracking-wider uppercase mb-3">
          {product.tagline}
        </p>

        <p className="text-xs text-white/70 leading-relaxed mb-4 flex-1">
          {product.description}
        </p>

        {/* Color Swatch Selector */}
        <div className="mb-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50 block mb-2">
            Finish: {selectedColor.name}
          </span>
          <div className="flex gap-2.5">
            {product.colors.map((color) => {
              const isSelected = selectedColor.name === color.name;
              return (
                <button
                  key={color.name}
                  onClick={() => handleColorChange(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                    isSelected ? 'border-white scale-110 shadow-md' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  {isSelected && (
                    <Check className={`w-3.5 h-3.5 ${color.hex === '#E2E8F0' || color.hex === '#F1F5F9' ? 'text-slate-900' : 'text-white'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Features list */}
        <ul className="mb-4 space-y-1.5 border-t border-white/10 pt-4">
          {product.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-1.5 text-xs text-white/70">
              <span className="text-indigo-400 mt-1 font-bold text-[10px]">•</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Technical Specs Accordion Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowSpecs(!showSpecs)}
            className="flex items-center gap-1 text-[11px] font-mono font-bold text-white/60 hover:text-white tracking-wider uppercase transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            {showSpecs ? 'Hide Technical Specs' : 'Show Technical Specs'}
          </button>

          {showSpecs && (
            <div className="mt-3 bg-black/40 rounded-2xl p-3 border border-white/10 space-y-1.5 animate-fadeIn">
              {product.specs.map((spec, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-white/40 font-medium">{spec.label}</span>
                  <span className="text-white font-bold text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions Row */}
        <div className="flex gap-2 mt-auto">
          {product.isCustomizable && onCustomize && (
            <button
              onClick={() => {
                const element = document.getElementById('hero');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
                onCustomize(selectedColor.value3d);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 border border-white/15 hover:border-white/30 hover:bg-white/5 rounded-xl px-3 py-3 text-xs font-mono font-bold tracking-wider uppercase text-white/80 hover:text-white transition-all shadow-md"
            >
              <Sliders className="w-3.5 h-3.5" />
              Tweak 3D
            </button>
          )}

          <button
            onClick={handleAdd}
            disabled={isAdding}
            className={`flex-2 flex items-center justify-center gap-1.5 text-xs font-mono font-extrabold uppercase tracking-widest rounded-xl px-4 py-3 transition-all duration-300 shadow-md ${
              isAdding
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'
            }`}
          >
            {isAdding ? (
              <>
                <Check className="w-4 h-4 animate-scaleIn text-white" />
                Added to Bag
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add to Bag
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
