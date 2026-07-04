/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CartItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, CreditCard, ArrowRight, CheckCircle2, Truck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  setCart,
}) => {
  // Wizard steps: 'cart' | 'shipping' | 'payment' | 'success'
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'shipping' | 'payment' | 'success'>('cart');
  const [shippingForm, setShippingForm] = useState({ name: '', email: '', address: '', city: '', postalCode: '' });
  const [paymentForm, setPaymentForm] = useState({ cardNumber: '', expiry: '', cvv: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shipping = subtotal > 250 || subtotal === 0 ? 0 : 15;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shipping + tax;

  const handleUpdateQty = (itemId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return { ...item, quantity: Math.max(1, newQty) };
          }
          return item;
        })
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const handleProceedToShipping = () => {
    if (cart.length === 0) return;
    setCheckoutStep('shipping');
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingForm.name || !shippingForm.email || !shippingForm.address) return;
    setCheckoutStep('payment');
  };

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.cardNumber || !paymentForm.expiry) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setGeneratedOrderId(`AURA-${Math.floor(100000 + Math.random() * 900000)}`);
      setCheckoutStep('success');
    }, 1800);
  };

  const handleResetCheckout = () => {
    setCart([]);
    setCheckoutStep('cart');
    setShippingForm({ name: '', email: '', address: '', city: '', postalCode: '' });
    setPaymentForm({ cardNumber: '', expiry: '', cvv: '' });
    onClose();
  };

  // Format card number with spaces as user types
  const handleCardNumberChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    const formatted = clean.match(/.{1,4}/g)?.join(' ') || clean;
    setPaymentForm({ ...paymentForm, cardNumber: formatted.substring(0, 19) });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs"
          />

          {/* Drawer Body */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[440px] bg-black/60 backdrop-blur-2xl text-white shadow-2xl flex flex-col h-full border-l border-white/10"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="font-sans font-extrabold text-lg text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-indigo-400" />
                  {checkoutStep === 'cart' && 'Your Shopping Bag'}
                  {checkoutStep === 'shipping' && 'Delivery Information'}
                  {checkoutStep === 'payment' && 'Secure Checkout'}
                  {checkoutStep === 'success' && 'Order Confirmed'}
                </h2>
                {checkoutStep === 'cart' && cart.length > 0 && (
                  <span className="text-[11px] font-mono text-white/50">
                    {cart.reduce((acc, item) => acc + item.quantity, 0)} Items Selected
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 text-white/40 hover:text-white hover:border-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main scrollable body */}
            <div className="flex-1 overflow-y-auto p-6">
              {checkoutStep === 'cart' && (
                <>
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                        <ShoppingBag className="w-6 h-6 text-white/40" />
                      </div>
                      <h3 className="font-sans font-bold text-base text-white mb-1">Your bag is empty</h3>
                      <p className="text-xs text-white/50 max-w-xs leading-relaxed mb-6">
                        Explore our high-fidelity collection and craft your personalized acoustics.
                      </p>
                      <button
                        onClick={onClose}
                        className="text-xs font-mono font-extrabold uppercase tracking-widest bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
                      >
                        Start Exploring
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-4 pb-6 border-b border-white/10 last:border-0 last:pb-0"
                        >
                          {/* Item Preview */}
                          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                            {/* Simple render of item shape & color */}
                            <div className="relative w-12 h-12 flex items-center justify-center">
                              <div
                                className="absolute w-10 h-10 rounded-full border-4 border-b-transparent"
                                style={{ borderColor: item.product.colors.find(c => c.name === item.selectedColor)?.hex || '#334155', borderBottomColor: 'transparent' }}
                              />
                              <div className="absolute w-4 h-4 rounded-full bg-white/10 border border-white/20" />
                            </div>
                          </div>

                          {/* Item Info */}
                          <div className="flex-1 flex flex-col">
                            <h4 className="font-sans font-bold text-sm text-white leading-snug">
                              {item.product.name}
                            </h4>
                            <span className="text-[10px] font-mono font-bold tracking-wider text-indigo-400 uppercase mt-0.5">
                              Finish: {item.selectedColor}
                            </span>
                            <div className="flex justify-between items-center mt-3">
                              {/* Quantity selectors */}
                              <div className="flex items-center gap-2 border border-white/10 rounded-lg p-1 bg-white/5">
                                <button
                                  onClick={() => handleUpdateQty(item.id, -1)}
                                  className="w-5 h-5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-mono font-bold text-white w-5 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleUpdateQty(item.id, 1)}
                                  className="w-5 h-5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Price and Delete */}
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-bold text-sm text-white">
                                  ${item.product.price * item.quantity}
                                </span>
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-white/30 hover:text-red-400 transition-colors"
                                  title="Remove Item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Shipping Wizard Step */}
              {checkoutStep === 'shipping' && (
                <form onSubmit={handleProceedToPayment} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50 block mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingForm.name}
                      onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:bg-white/10 focus:outline-hidden focus:border-indigo-500 transition-all font-mono"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50 block mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={shippingForm.email}
                      onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:bg-white/10 focus:outline-hidden focus:border-indigo-500 transition-all font-mono"
                      placeholder="jane@example.com"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50 block mb-1.5">
                      Shipping Address
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingForm.address}
                      onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:bg-white/10 focus:outline-hidden focus:border-indigo-500 transition-all font-mono"
                      placeholder="742 Evergreen Terrace"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50 block mb-1.5">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingForm.city}
                        onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:bg-white/10 focus:outline-hidden focus:border-indigo-500 transition-all font-mono"
                        placeholder="Springfield"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50 block mb-1.5">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingForm.postalCode}
                        onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:bg-white/10 focus:outline-hidden focus:border-indigo-500 transition-all font-mono"
                        placeholder="90210"
                      />
                    </div>
                  </div>

                  {/* Trust indicator */}
                  <div className="mt-8 flex items-center gap-2 bg-white/5 border border-white/10 p-3.5 rounded-xl text-white/60 text-[10px] leading-relaxed">
                    <Truck className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Enjoy premium tracked delivery. Orders above $250 qualify for complimentary courier delivery.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-6 flex items-center justify-center gap-2 bg-indigo-600 text-white font-mono text-xs font-bold tracking-widest uppercase py-4 rounded-xl hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20"
                  >
                    Proceed to Payment
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Payment Wizard Step */}
              {checkoutStep === 'payment' && (
                <form onSubmit={handleCompleteOrder} className="space-y-4">
                  {/* Credit Card Graphic */}
                  <div className="bg-gradient-to-br from-indigo-950 to-indigo-900 rounded-2xl p-5 text-white shadow-lg border border-indigo-500/20 mb-6 flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                      <CreditCard className="w-8 h-8 text-indigo-400" />
                      <span className="font-mono text-[9px] font-bold tracking-widest uppercase opacity-65">AURA VIP COURIER</span>
                    </div>

                    <div className="font-mono text-base tracking-widest text-center my-2">
                      {paymentForm.cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div className="flex justify-between items-end font-mono text-[10px]">
                      <div>
                        <span className="block opacity-45 uppercase text-[8px] mb-0.5">Card Holder</span>
                        <span className="font-bold tracking-wide uppercase">{shippingForm.name || 'JANE DOE'}</span>
                      </div>
                      <div>
                        <span className="block opacity-45 uppercase text-[8px] mb-0.5">Expires</span>
                        <span className="font-bold tracking-wide">{paymentForm.expiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50 block mb-1.5">
                      Credit Card Number
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentForm.cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:bg-white/10 focus:outline-hidden focus:border-indigo-500 transition-all font-mono"
                      placeholder="4111 2222 3333 4444"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50 block mb-1.5">
                        Expiration
                      </label>
                      <input
                        type="text"
                        required
                        value={paymentForm.expiry}
                        maxLength={5}
                        onChange={(e) => setPaymentForm({ ...paymentForm, expiry: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:bg-white/10 focus:outline-hidden focus:border-indigo-500 transition-all font-mono"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50 block mb-1.5">
                        CVV Code
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={paymentForm.cvv}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:bg-white/10 focus:outline-hidden focus:border-indigo-500 transition-all font-mono"
                        placeholder="•••"
                      />
                    </div>
                  </div>

                  {/* Trust badge */}
                  <div className="mt-8 flex items-center gap-2 bg-white/5 border border-white/10 p-3.5 rounded-xl text-white/60 text-[10px] leading-relaxed">
                    <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                    <span>Secure 256-bit SSL encrypted connection. Your credentials are never stored.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className={`w-full mt-6 flex items-center justify-center gap-2 bg-indigo-600 text-white font-mono text-xs font-bold tracking-widest uppercase py-4 rounded-xl transition-all shadow-md shadow-indigo-600/20 ${
                      isProcessing ? 'bg-indigo-800 cursor-not-allowed' : 'hover:bg-indigo-500'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Authorizing Transaction...
                      </>
                    ) : (
                      <>
                        Complete Purchase (${total.toFixed(2)})
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Success Confirmation Step */}
              {checkoutStep === 'success' && (
                <div className="h-full flex flex-col items-center justify-center text-center py-6">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mb-6 text-emerald-400 shadow-lg"
                  >
                    <CheckCircle2 className="w-10 h-10 animate-bounce-subtle" />
                  </motion.div>

                  <h3 className="font-sans font-extrabold text-lg text-white mb-2">
                    Acoustic Order Placed!
                  </h3>
                  <p className="text-xs text-white/70 max-w-sm leading-relaxed mb-6">
                    Congratulations, <span className="font-bold text-white">{shippingForm.name}</span>! Your premium order has been successfully transmitted to our crafting workshops.
                  </p>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full mb-8 font-mono text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/40">Order ID:</span>
                      <span className="font-bold text-white">{generatedOrderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Recipient:</span>
                      <span className="font-bold text-white">{shippingForm.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Shipment Type:</span>
                      <span className="font-bold text-white font-semibold">Tracked Courier</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-2">
                      <span className="text-white/40 font-medium">Delivery Date:</span>
                      <span className="font-extrabold text-indigo-400">In 3-5 Business Days</span>
                    </div>
                  </div>

                  <button
                    onClick={handleResetCheckout}
                    className="w-full text-xs font-mono font-extrabold uppercase tracking-widest bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-500 shadow-md transition-all animate-bounce-subtle"
                  >
                    Keep Customizing
                  </button>
                </div>
              )}
            </div>

            {/* Sticky summary footer */}
            {checkoutStep !== 'success' && cart.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-white/5">
                <div className="space-y-2 font-mono text-xs mb-4">
                  <div className="flex justify-between text-white/50">
                    <span>Subtotal</span>
                    <span className="font-bold text-white">${subtotal}</span>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>VIP Tracked Courier</span>
                    <span className="font-bold text-white">
                      {shipping === 0 ? 'FREE' : `$${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>VAT (8%)</span>
                    <span className="font-bold text-white">${tax}</span>
                  </div>
                  <div className="flex justify-between text-white text-sm border-t border-white/10 pt-2">
                    <span className="font-extrabold uppercase">Order Total</span>
                    <span className="font-extrabold text-indigo-400">${total.toFixed(2)}</span>
                  </div>
                </div>

                {checkoutStep === 'cart' && (
                  <button
                    onClick={handleProceedToShipping}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-mono text-xs font-extrabold tracking-widest uppercase py-4 rounded-xl hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20"
                  >
                    Proceed to Delivery
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
