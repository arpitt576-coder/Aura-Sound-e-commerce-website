/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeadphoneShowcase3D } from './components/HeadphoneShowcase3D';
import { ProductCard } from './components/ProductCard';
import { AcousticStudio } from './components/AcousticStudio';
import { CartDrawer } from './components/CartDrawer';
import { products, hotspots } from './data';
import { Product, CartItem, SoundProfile } from './types';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';
import { 
  Sliders, 
  Sparkles, 
  Volume2, 
  ShieldCheck, 
  RotateCcw, 
  Layers, 
  HelpCircle, 
  Plus, 
  Compass, 
  Heart, 
  CheckCircle,
  FileSpreadsheet,
  FileDown
} from 'lucide-react';

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Interactive 3D Model customizer state
  // Holds the value3d hex string that maps directly to the active Three.js mesh colors
  const [selectedColorHex, setSelectedColorHex] = useState('#1E293B'); // defaults to Midnight Matte
  const [isExploded, setIsExploded] = useState(false);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);

  // Dynamic products specifications selected to export as PDF or compare in table
  const [selectedSpecProducts, setSelectedSpecProducts] = useState<string[]>(['aura-one', 'aura-buds', 'aura-studio']);

  const toggleSpecProduct = (id: string) => {
    setSelectedSpecProducts((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter((p) => p !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const downloadSpecPDF = () => {
    // Create jsPDF instance (standard A4 portrait format in millimeters)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Set background a very clean cool off-white (light slate feel)
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Header Section with Indigo Accent border on top
    doc.setFillColor(79, 70, 229); // indigo-600
    doc.rect(0, 0, pageWidth, 5, 'F');

    // Brand Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text('AURA SOUND INC. / ENGINEERING DIVISION', margin, 20);

    // Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('ARCHITECTURAL SPECIFICATION SUMMARY', margin, 30);

    // Subtitle / Metadata
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generated on ${dateStr} (UTC) | Reference: SPEC-AURA-2026`, margin, 36);

    // Subtle separator line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(margin, 42, pageWidth - margin, 42);

    // Brief description
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text('This document contains verified laboratory benchmarks, mechanical parameters, and transducer thresholds.', margin, 48);

    // Prepare table data
    const specRows = [
      { label: 'Transducer Tech', values: { 'aura-one': '40mm Beryllium Dome', 'aura-buds': 'Dual-Balanced Armature', 'aura-studio': '90mm Planar Magnetic' } },
      { label: 'Acoustic Enclosure', values: { 'aura-one': 'Closed-Back / ANC Chamber', 'aura-buds': 'Sealed In-Ear Isolation', 'aura-studio': 'Acoustically Open-Back' } },
      { label: 'Frequency Response', values: { 'aura-one': '4 Hz - 45,000 Hz', 'aura-buds': '15 Hz - 22,000 Hz', 'aura-studio': '2 Hz - 54,000 Hz' } },
      { label: 'Max Battery Life', values: { 'aura-one': '40 Hours (ANC On)', 'aura-buds': '24 Hours (with Case)', 'aura-studio': 'Passive (Wired)' } },
      { label: 'Latency Mode', values: { 'aura-one': 'Bluetooth 5.3 & Ultra-Low latency', 'aura-buds': 'Bluetooth 5.3 Multipoint', 'aura-studio': 'Zero Latency (Wired Balanced XLR)' } },
      { label: 'Mass Weight', values: { 'aura-one': '285g', 'aura-buds': '5.4g per earbud', 'aura-studio': '340g' } }
    ];

    // Draw the Table
    let currentY = 58;
    const specColWidth = 45;
    const numProducts = selectedSpecProducts.length;
    const productColWidth = (contentWidth - specColWidth) / numProducts;

    // Header Row background
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(margin, currentY, contentWidth, 12, 'F');

    // Header Row Text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('ARCHITECTURAL SPEC', margin + 4, currentY + 7.5);

    selectedSpecProducts.forEach((prodId, idx) => {
      const pName = prodId === 'aura-one' ? 'AURA ONE' : prodId === 'aura-buds' ? 'AURA BUDS' : 'AURA STUDIO';
      doc.text(pName, margin + specColWidth + (idx * productColWidth) + 4, currentY + 7.5);
    });

    currentY += 12;

    // Table Body Rows
    specRows.forEach((row, rowIdx) => {
      // Alternating background colors
      if (rowIdx % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(241, 245, 249); // slate-100
      }
      doc.rect(margin, currentY, contentWidth, 12, 'F');

      // Draw borders
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.2);
      doc.rect(margin, currentY, contentWidth, 12, 'S');

      // Spec label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85); // slate-700
      doc.text(row.label, margin + 4, currentY + 7.5);

      // Spec values for selected products
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105); // slate-600

      selectedSpecProducts.forEach((prodId, idx) => {
        const val = row.values[prodId as 'aura-one' | 'aura-buds' | 'aura-studio'] || 'N/A';
        
        // Let's handle long text wrapping if any
        const textX = margin + specColWidth + (idx * productColWidth) + 4;
        const textWidth = productColWidth - 8;
        const splitText = doc.splitTextToSize(val, textWidth);
        
        if (splitText.length > 1) {
          doc.text(splitText, textX, currentY + 5.5);
        } else {
          doc.text(val, textX, currentY + 7.5);
        }
      });

      currentY += 12;
    });

    // Highlight Section: Selected Products details
    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('PRODUCT BENCHMARKS & ACOUSTIC DESCRIPTIONS', margin, currentY);
    currentY += 5;

    selectedSpecProducts.forEach((prodId) => {
      const fullProd = products.find(p => p.id === prodId);
      if (!fullProd) return;

      // Check page overflow
      if (currentY + 32 > pageHeight - 20) {
        doc.addPage();
        // Re-fill background for new page
        doc.setFillColor(248, 250, 252); // slate-50
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Header accent on new page
        doc.setFillColor(79, 70, 229); // indigo-600
        doc.rect(0, 0, pageWidth, 5, 'F');
        
        currentY = 20;
      }

      // Border container for each product highlight
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, currentY, contentWidth, 26, 'F');
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.3);
      doc.rect(margin, currentY, contentWidth, 26, 'S');

      // Left Accent bar (Indigo-600)
      doc.setFillColor(79, 70, 229);
      doc.rect(margin, currentY, 1.5, 26, 'F');

      // Product Name & Tagline & Price
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(`${fullProd.name.toUpperCase()}  |  ${fullProd.tagline}`, margin + 5, currentY + 6);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(79, 70, 229); // Indigo-600
      doc.text(`$${fullProd.price} USD`, margin + contentWidth - 25, currentY + 6);

      // Description text wrapping
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139); // slate-500
      const descText = fullProd.description;
      const splitDesc = doc.splitTextToSize(descText, contentWidth - 10);
      doc.text(splitDesc, margin + 5, currentY + 12);

      // Draw some bullet features
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105); // slate-700
      const featuresStr = `Key Highpoints: ${fullProd.features.slice(0, 3).join('  •  ')}`;
      doc.text(featuresStr, margin + 5, currentY + 22);

      currentY += 32;
    });

    // Footer on current page
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('CONFIDENTIAL / INTENDED FOR END-USER EVALUATION ONLY', margin, pageHeight - 15);
    doc.setFont('helvetica', 'normal');
    doc.text('© AURA SOUND INC. CRAFTED WITH ABSOLUTE PRECISION', margin + contentWidth - 85, pageHeight - 15);

    // Save the PDF
    doc.save(`Aura_Acoustics_Spec_Summary_${selectedSpecProducts.join('_')}.pdf`);
  };

  // Acoustic DSP Profiler state
  const [soundProfile, setSoundProfile] = useState<SoundProfile>({
    bass: 55,
    mid: 50,
    treble: 65,
    environment: 'studio'
  });

  // Newsletter simulation state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Synchronize active navigation section based on window scrolling position
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroOffset = document.getElementById('hero')?.offsetTop || 0;
      const productsOffset = document.getElementById('products')?.offsetTop || 500;
      const acousticOffset = document.getElementById('acoustic')?.offsetTop || 1200;

      const buffer = 200;
      if (scrollY >= acousticOffset - buffer) {
        setActiveSection('acoustic');
      } else if (scrollY >= productsOffset - buffer) {
        setActiveSection('products');
      } else {
        setActiveSection('hero');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = (product: Product, selectedColor: string) => {
    setCart((prevCart) => {
      const itemId = `${product.id}-${selectedColor}`;
      const existing = prevCart.find((item) => item.id === itemId);

      if (existing) {
        return prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { id: itemId, product, selectedColor, quantity: 1 }];
      }
    });

    // Auto open cart for premium instant shopping feedback
    setIsCartOpen(true);
  };

  // Allows customizing the main 3D headphone directly from anywhere (like clicking "Tweak 3D" on product cards)
  const handleCustomize3D = (colorHex: string) => {
    setSelectedColorHex(colorHex);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
    }, 2000);
  };

  // Find the customizable headphone product object to link actions directly
  const customProduct = products.find((p) => p.id === 'aura-one')!;
  const activeColorObj = customProduct.colors.find((c) => c.value3d === selectedColorHex) || customProduct.colors[0];

  return (
    <div className="min-h-screen bg-[#050508] text-white selection:bg-indigo-600 selection:text-white flex flex-col relative overflow-hidden">
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-10 w-80 h-80 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 left-1/3 w-96 h-96 rounded-full bg-indigo-500/5 blur-[150px] pointer-events-none" />

      {/* Premium Header */}
      <Header
        cart={cart}
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Container */}
      <main className="flex-1" id="main-content">
        
        {/* HERO SECTION: Interactive 3D Customizer Dashboard */}
        <section 
          id="hero" 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center border-b border-white/10"
        >
          {/* Hero Left Content: Copy, Tweak Controls, Hotspots anchor */}
          <div className="lg:col-span-5 flex flex-col" id="hero-left-column">
            {/* Tagline */}
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Next-Gen Spatial Audio
            </span>

            {/* Main Title */}
            <h1 className="font-sans font-extrabold text-4xl sm:text-5xl text-white tracking-tight leading-[1.1] mb-4">
              Aura One.<br />
              Sculpted Sound.
            </h1>

            {/* Description */}
            <p className="text-sm text-white/70 leading-relaxed mb-8">
              Experience audiophile acoustics combined with cutting-edge 3D configuration. Choose your bespoke finish and slide open the components to explore our beryllium drivers and luxury aluminum pivots in real-time.
            </p>

            {/* Interactive Color Choice Row */}
            <div className="mb-6 bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/50 block mb-3">
                Bespoke Finish: {activeColorObj.name}
              </span>
              <div className="flex gap-3">
                {customProduct.colors.map((color) => {
                  const isSelected = selectedColorHex === color.value3d;
                  return (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColorHex(color.value3d)}
                      className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
                        isSelected 
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md scale-102' 
                          : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30 hover:bg-white/10'
                      }`}
                    >
                      <span 
                        className="w-3 h-3 rounded-full border border-white/20 block"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hotspots Quick Navigation Guide */}
            <div className="mb-8">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/50 block mb-3">
                Select Component Feature Highlight:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {hotspots.map((spot, i) => {
                  const isActive = activeHotspotId === spot.id;
                  return (
                    <button
                      key={spot.id}
                      onClick={() => setActiveHotspotId(isActive ? null : spot.id)}
                      className={`text-left p-2.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-2 ${
                        isActive
                          ? 'bg-indigo-500/20 border-indigo-500 text-white font-bold shadow-md'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        isActive ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/40'
                      }`}>
                        0{i + 1}
                      </span>
                      <span className="truncate">{spot.title.replace('Suspended ', '').replace('Precision ', '')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direct CTA */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleAddToCart(customProduct, activeColorObj.name)}
                className="flex-1 bg-indigo-600 text-white font-mono text-xs font-extrabold uppercase tracking-widest py-4 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 hover:scale-101 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Customized Aura One — ${customProduct.price}
              </button>
            </div>
          </div>

          {/* Hero Right Content: 3D Viewport Panel */}
          <div className="lg:col-span-7 flex flex-col justify-center" id="hero-right-column">
            <HeadphoneShowcase3D
              selectedColorHex={selectedColorHex}
              isExploded={isExploded}
              onExplodedToggle={setIsExploded}
              activeHotspotId={activeHotspotId}
              setActiveHotspotId={setActiveHotspotId}
            />
          </div>
        </section>

        {/* TRUST ACCENT BANNER */}
        <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-xs text-white">Five-Year Premium Warranty</h4>
                <p className="text-[11px] text-white/50 font-mono">Precision mechanical engineering protection.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3 border-y border-white/10 py-4 md:py-0 md:border-y-0 md:border-x md:border-white/10 md:px-6">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-xs text-white">Free Worldwide Courier Express</h4>
                <p className="text-[11px] text-white/50 font-mono">Direct secure tracked courier dispatch.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-sans font-bold text-xs text-white">Custom DSP Sound Signature</h4>
                <p className="text-[11px] text-white/50 font-mono">Tailored digital filter equalizers.</p>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCTS SECTION: Clean Product Grid */}
        <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-b border-white/10 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase block mb-2">
              Aura Sound Vault
            </span>
            <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-white tracking-tight mb-4">
              The Master Collection
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">
              Every acoustic piece represents a perfect synergy of premium materials, state-of-the-art beryllium dynamic or planar transducers, and beautiful architectural shapes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onCustomize={handleCustomize3D}
              />
            ))}
          </div>
        </section>

        {/* ACOUSTIC STUDIO LAB SECTION */}
        <section id="acoustic" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 border-b border-white/10 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase block mb-2">
              Acoustic Personalization Lab
            </span>
            <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-white tracking-tight mb-4">
              Calibrate Your Signature
            </h2>
            <p className="text-sm text-white/70 leading-relaxed">
              Tweak parametric decibel gains for low-frequency rumble, mids presence, and high-frequency details. Simulate environment noise-attenuation or wide-room reverb.
            </p>
          </div>

          <AcousticStudio
            soundProfile={soundProfile}
            setSoundProfile={setSoundProfile}
          />
        </section>

        {/* DETAILED TECHNICAL SPECIFICATION MATRIX */}
        <section id="matrix" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase block mb-2">
              Architectural Specifications
            </span>
            <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-white tracking-tight mb-4">
              Engineered Comparison Matrix
            </h2>
            <p className="text-xs text-white/50 leading-relaxed">
              Examine the strict electrical, acoustic, and mechanical thresholds of each audio piece in our current lineup.
            </p>
          </div>

          {/* PDF EXPORT & INTERACTIVE SPEC FILTER BAR */}
          <div className="mb-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase block">
                Export & Comparative Filtering
              </span>
              <p className="text-xs text-white/70">
                Select specific models to narrow down the comparison and generate a custom PDF datasheet.
              </p>
              
              {/* Checkboxes group */}
              <div className="flex flex-wrap gap-3 mt-3">
                {[
                  { id: 'aura-one', name: 'Aura One' },
                  { id: 'aura-buds', name: 'Aura Buds' },
                  { id: 'aura-studio', name: 'Aura Studio' }
                ].map((prod) => {
                  const isChecked = selectedSpecProducts.includes(prod.id);
                  return (
                    <button
                      key={prod.id}
                      onClick={() => toggleSpecProduct(prod.id)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                          : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:bg-white/5'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded flex items-center justify-center border text-[8px] transition-all ${
                        isChecked 
                          ? 'bg-indigo-600 border-indigo-500 text-white' 
                          : 'border-white/20'
                      }`}>
                        {isChecked && "✓"}
                      </span>
                      {prod.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={downloadSpecPDF}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-wider px-5 py-3.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 flex items-center justify-center gap-2 shrink-0 self-start md:self-center cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              Download Spec Sheet (PDF)
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-[10px] font-mono font-bold text-white/40 tracking-wider uppercase">
                    <th className="p-5">Architectural Spec</th>
                    {selectedSpecProducts.includes('aura-one') && <th className="p-5 text-white">Aura One</th>}
                    {selectedSpecProducts.includes('aura-buds') && <th className="p-5 text-white">Aura Buds</th>}
                    {selectedSpecProducts.includes('aura-studio') && <th className="p-5 text-white">Aura Studio</th>}
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-white/10 font-mono text-white/80">
                  <tr>
                    <td className="p-5 font-bold text-white bg-white/5">Transducer Tech</td>
                    {selectedSpecProducts.includes('aura-one') && <td className="p-5">40mm Beryllium Dome</td>}
                    {selectedSpecProducts.includes('aura-buds') && <td className="p-5">Dual-Balanced Armature</td>}
                    {selectedSpecProducts.includes('aura-studio') && <td className="p-5">90mm Planar Magnetic</td>}
                  </tr>
                  <tr>
                    <td className="p-5 font-bold text-white bg-white/5">Acoustic Enclosure</td>
                    {selectedSpecProducts.includes('aura-one') && <td className="p-5">Closed-Back / ANC Chamber</td>}
                    {selectedSpecProducts.includes('aura-buds') && <td className="p-5">Sealed In-Ear Isolation</td>}
                    {selectedSpecProducts.includes('aura-studio') && <td className="p-5">Acoustically Open-Back</td>}
                  </tr>
                  <tr>
                    <td className="p-5 font-bold text-white bg-white/5">Frequency Response</td>
                    {selectedSpecProducts.includes('aura-one') && <td className="p-5">4 Hz - 45,000 Hz</td>}
                    {selectedSpecProducts.includes('aura-buds') && <td className="p-5">15 Hz - 22,000 Hz</td>}
                    {selectedSpecProducts.includes('aura-studio') && <td className="p-5">2 Hz - 54,000 Hz</td>}
                  </tr>
                  <tr>
                    <td className="p-5 font-bold text-white bg-white/5">Max Battery Life</td>
                    {selectedSpecProducts.includes('aura-one') && <td className="p-5">40 Hours (ANC On)</td>}
                    {selectedSpecProducts.includes('aura-buds') && <td className="p-5">24 Hours (with Case)</td>}
                    {selectedSpecProducts.includes('aura-studio') && <td className="p-5">Passive (Wired)</td>}
                  </tr>
                  <tr>
                    <td className="p-5 font-bold text-white bg-white/5">Latency Mode</td>
                    {selectedSpecProducts.includes('aura-one') && <td className="p-5">Bluetooth 5.3 & Ultra-Low latency</td>}
                    {selectedSpecProducts.includes('aura-buds') && <td className="p-5">Bluetooth 5.3 Multipoint</td>}
                    {selectedSpecProducts.includes('aura-studio') && <td className="p-5">Zero Latency (Wired Balanced XLR)</td>}
                  </tr>
                  <tr>
                    <td className="p-5 font-bold text-white bg-white/5">Mass Weight</td>
                    {selectedSpecProducts.includes('aura-one') && <td className="p-5">285g</td>}
                    {selectedSpecProducts.includes('aura-buds') && <td className="p-5">5.4g per earbud</td>}
                    {selectedSpecProducts.includes('aura-studio') && <td className="p-5">340g</td>}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </main>      {/* FOOTER */}
      <footer className="bg-black/80 backdrop-blur-xl text-white border-t border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <span className="font-sans font-extrabold text-lg tracking-widest text-white uppercase block">
              Aura Sound
            </span>
            <p className="text-xs text-white/50 leading-relaxed max-w-sm">
              We design luxury acoustic modules, equalizers, and hardware-accelerated soundstages for discriminating audiophiles worldwide.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-white/40">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span>HANDMADE IN CRAFT WORKSHOPS</span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 space-y-3 font-mono text-xs">
            <h4 className="text-white uppercase font-bold tracking-wider text-[10px] mb-4">Navigations</h4>
            <a href="#hero" className="block text-white/50 hover:text-indigo-400 transition-colors">3D Customizer</a>
            <a href="#products" className="block text-white/50 hover:text-indigo-400 transition-colors">The Master Collection</a>
            <a href="#acoustic" className="block text-white/50 hover:text-indigo-400 transition-colors">Acoustic Calibration Studio</a>
          </div>

          {/* Newsletter subscription Column */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-white font-mono uppercase font-bold tracking-wider text-[10px]">Aura Dispatch Newsletter</h4>
            <p className="text-xs text-white/50 leading-relaxed">
              Subscribe to unlock acoustic insights, driver reports, and limited edition drops.
            </p>

            {newsletterSubscribed ? (
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/30">
                <CheckCircle className="w-4 h-4" />
                Dispatch Subscription Registered!
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="bg-white/5 text-xs font-mono rounded-xl px-4 py-3 border border-white/10 text-white focus:outline-hidden focus:border-indigo-500 flex-1"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white font-mono text-xs font-bold uppercase tracking-wider px-4 rounded-xl hover:bg-indigo-500 transition-colors shrink-0 shadow-md"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Deep bottom copy line */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-white/10 text-center font-mono text-[9px] text-white/40 flex flex-col sm:flex-row justify-between gap-4">
          <span>© {new Date().getFullYear()} Aura Sound Inc. All rights reserved.</span>
          <span className="flex items-center justify-center gap-1">
            Made with absolute precision.
          </span>
        </div>
      </footer>

      {/* Sliding Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        setCart={setCart}
      />
    </div>
  );
}
