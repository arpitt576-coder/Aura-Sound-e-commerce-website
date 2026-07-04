/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  tagline: string;
  price: number;
  rating: number;
  reviewsCount: number;
  description: string;
  category: 'headphones' | 'earbuds' | 'accessories';
  colors: { name: string; hex: string; value3d: string }[];
  features: string[];
  specs: { label: string; value: string }[];
  isCustomizable: boolean;
}

export interface CartItem {
  id: string; // unique id combining product.id + selectedColor
  product: Product;
  selectedColor: string;
  quantity: number;
}

export interface SoundProfile {
  bass: number;
  mid: number;
  treble: number;
  environment: 'studio' | 'concert' | 'ambient';
}

export interface Hotspot {
  id: string;
  title: string;
  description: string;
  position: [number, number, number]; // [x, y, z] for 3D marker
}
