/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Hotspot } from './types';

export const products: Product[] = [
  {
    id: 'aura-one',
    name: 'Aura One',
    tagline: 'Pure Auditory Perfection',
    price: 399,
    rating: 4.9,
    reviewsCount: 142,
    description: 'Designed for audiophiles who demand the absolute finest. Crafted with custom 40mm Beryllium-coated dynamic drivers, bespoke aluminum frames, and responsive ANC, Aura One delivers a pure, uncompromised studio soundscape with a highly detailed, open acoustic response.',
    category: 'headphones',
    colors: [
      { name: 'Midnight Matte', hex: '#1E293B', value3d: '#1E293B' },
      { name: 'Platinum Silver', hex: '#E2E8F0', value3d: '#D1D5DB' },
      { name: 'Obsidian Gold', hex: '#D97706', value3d: '#B45309' }
    ],
    features: [
      '40mm Beryllium Dynamic Drivers',
      'Advanced Hybrid Active Noise Cancelling (ANC)',
      'High-Resolution LDAC, AAC & aptX Adaptive',
      'Smart Auto-Play/Pause Wear Sensors',
      'Up to 40 Hours Battery Life (ANC On)'
    ],
    specs: [
      { label: 'Driver Unit', value: '40mm Custom Beryllium Dome' },
      { label: 'Frequency Response', value: '4 Hz - 45,000 Hz' },
      { label: 'Sensitivity', value: '102 dB/mW' },
      { label: 'Battery Capacity', value: '1100 mAh (USB-C Fast Charge)' },
      { label: 'Weight', value: '285g' }
    ],
    isCustomizable: true
  },
  {
    id: 'aura-buds',
    name: 'Aura Buds',
    tagline: 'Acoustic Craft, Miniature Scale',
    price: 199,
    rating: 4.8,
    reviewsCount: 88,
    description: 'Compact wireless earbuds that deliver an expansive, deep soundstage. Featuring customized dual-balanced armature drivers, personalized ear canal matching, and IPX5 resistance, Aura Buds are the perfect companion for premium active listening.',
    category: 'earbuds',
    colors: [
      { name: 'Charcoal Grey', hex: '#334155', value3d: '#334155' },
      { name: 'Arctic Pearl', hex: '#F1F5F9', value3d: '#FFFFFF' }
    ],
    features: [
      'Dual Balanced Armature Drivers',
      'Adaptive Ambient Transparency Mode',
      'IPX5 Sweat & Rain Resistance',
      'Dual Beamforming Noise-Reduction Mics',
      '6 Hours Playback (Total 24 Hours with Case)'
    ],
    specs: [
      { label: 'Driver Unit', value: 'Dual Hybrid Armatures' },
      { label: 'Frequency Response', value: '15 Hz - 22,000 Hz' },
      { label: 'Connectivity', value: 'Bluetooth 5.3 (Multipoint)' },
      { label: 'Waterproofing', value: 'IPX5 Certified' },
      { label: 'Weight', value: '5.4g per earbud' }
    ],
    isCustomizable: false
  },
  {
    id: 'aura-studio',
    name: 'Aura Studio',
    tagline: 'The Mastering Engineer\'s Dream',
    price: 549,
    rating: 5.0,
    reviewsCount: 37,
    description: 'An open-back planar magnetic headphone built strictly for mastering, professional mixing, and high-fidelity home audiophile systems. Expect razor-sharp detailing, zero distortion, and an incredibly airy soundstage.',
    category: 'headphones',
    colors: [
      { name: 'Walnut Wood', hex: '#78350F', value3d: '#5B2100' },
      { name: 'Pitch Black', hex: '#0F172A', value3d: '#0F172A' }
    ],
    features: [
      '90mm Planar Magnetic Transducers',
      'Acoustically Transparent Open-Back Housing',
      'Ultra-Soft Lambskin Leather Earpads',
      'Lightweight Carbon Fiber Arch & Suspended Yoke',
      'Detachable Dual-Sided Balanced XLR Cable'
    ],
    specs: [
      { label: 'Transducer Type', value: '90mm Planar Magnetic' },
      { label: 'Frequency Response', value: '2 Hz - 54,000 Hz' },
      { label: 'Impedance', value: '32 Ohms' },
      { label: 'Thd (Total Harmonic Distortion)', value: '< 0.05% (1kHz, 90dB)' },
      { label: 'Weight', value: '340g' }
    ],
    isCustomizable: false
  },
  {
    id: 'aura-shield',
    name: 'Aura Shield',
    tagline: 'Protect and Display Your Art',
    price: 89,
    rating: 4.7,
    reviewsCount: 54,
    description: 'An architectural headphone stand crafted from a single solid block of black walnut wood and aircraft-grade brushed aluminum, accompanied by a molded EVA hard-shell storage travel case.',
    category: 'accessories',
    colors: [
      { name: 'Dark Walnut', hex: '#451A03', value3d: '#451A03' },
      { name: 'Brushed Silver', hex: '#94A3B8', value3d: '#94A3B8' }
    ],
    features: [
      'Hand-Finished Solid Black Walnut Core',
      'Brushed Anodized T6 Aluminum Arms',
      'Integrated Cable Organizers & Storage Channel',
      'Heavy Silicon Gripped Bottom Base',
      'Semi-Rigid Waterproof Hardcase Included'
    ],
    specs: [
      { label: 'Material Base', value: 'Premium Solid Black Walnut' },
      { label: 'Metallic Arm', value: 'Anodized 6061-T6 Aluminum' },
      { label: 'Stand Height', value: '28.5 cm' },
      { label: 'Case Dimensions', value: '24 x 21 x 11 cm' },
      { label: 'Total weight', value: '450g' }
    ],
    isCustomizable: false
  }
];

export const hotspots: Hotspot[] = [
  {
    id: 'headband',
    title: 'Ergonomic Suspended Arch',
    description: 'Suspended tension-arch design with premium memory foam, covered in breathable knit textile to distribute weight evenly and eliminate fatigue.',
    position: [0, 2.1, 0]
  },
  {
    id: 'hinge',
    title: 'Precision Swivel Suspension',
    description: 'Multi-directional aluminum hinges allow the cups to rotate perfectly to seal any ear shape and lock in spatial audio acoustics.',
    position: [1.25, -0.2, 0.4]
  },
  {
    id: 'touch',
    title: 'Intuitive Swipe Controls',
    description: 'Crafted frosted-glass capacitive surface supports natural sweeps for volume adjustment, double taps to play/pause, and holding to toggle ANC modes.',
    position: [-1.25, -0.6, 0.6]
  },
  {
    id: 'driver',
    title: 'Beryllium-Coated Transducers',
    description: 'Ultra-lightweight and rigid 40mm beryllium diaphragm provides immediate transients, a deep robust bass shelf, and sparkling details up to 45kHz.',
    position: [0.95, -0.6, 0.1]
  }
];
