/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { SoundProfile } from '../types';
import { Sliders, Volume2, AudioLines, Music, HelpCircle, Flame, ShieldAlert } from 'lucide-react';

interface AcousticStudioProps {
  soundProfile: SoundProfile;
  setSoundProfile: React.Dispatch<React.SetStateAction<SoundProfile>>;
}

export const AcousticStudio: React.FC<AcousticStudioProps> = ({
  soundProfile,
  setSoundProfile,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [simulatedFrequency, setSimulatedFrequency] = useState(60);
  const [activePreset, setActivePreset] = useState<string>('balanced');

  // Animation frame reference
  const animationFrameId = useRef<number | null>(null);
  const phase = useRef(0);

  // Decibel meters state
  const [dbLevels, setDbLevels] = useState({ left: -6, right: -6 });

  // Update sound profile variables
  const handleSliderChange = (key: 'bass' | 'mid' | 'treble', value: number) => {
    setSoundProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
    setActivePreset('custom');
  };

  const applyPreset = (preset: string) => {
    setActivePreset(preset);
    if (preset === 'balanced') {
      setSoundProfile({ bass: 50, mid: 50, treble: 50, environment: soundProfile.environment });
    } else if (preset === 'bass_boost') {
      setSoundProfile({ bass: 85, mid: 40, treble: 60, environment: soundProfile.environment });
    } else if (preset === 'studio_reference') {
      setSoundProfile({ bass: 45, mid: 70, treble: 75, environment: soundProfile.environment });
    } else if (preset === 'acoustic_live') {
      setSoundProfile({ bass: 60, mid: 55, treble: 80, environment: soundProfile.environment });
    }
  };

  const handleEnvironmentChange = (env: 'studio' | 'concert' | 'ambient') => {
    setSoundProfile((prev) => ({
      ...prev,
      environment: env,
    }));
  };

  // Canvas visualizer rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = 180;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Base properties depending on sliders
      const bassAmp = (soundProfile.bass / 100) * 45;
      const midAmp = (soundProfile.mid / 100) * 25;
      const trebleAmp = (soundProfile.treble / 100) * 12;

      // Speed of waves is faster if "playing", otherwise slow ambient drift
      const speed = isPlaying ? 0.08 : 0.02;
      phase.current += speed;

      // Set environment visual characteristics
      let waveColor1 = 'rgba(99, 102, 241, 0.8)'; // Indigo neon
      let waveColor2 = 'rgba(168, 85, 247, 0.5)'; // Purple neon
      let waveColor3 = 'rgba(255, 255, 255, 0.2)'; // Crisp white neon

      if (soundProfile.environment === 'concert') {
        // High reverb - glowing amber & rose colors
        waveColor1 = 'rgba(236, 72, 153, 0.8)';
        waveColor2 = 'rgba(99, 102, 241, 0.5)';
        waveColor3 = 'rgba(168, 85, 247, 0.25)';
      } else if (soundProfile.environment === 'ambient') {
        // High attenuation - crisp teal / blue colors
        waveColor1 = 'rgba(20, 184, 166, 0.8)';
        waveColor2 = 'rgba(6, 182, 212, 0.5)';
        waveColor3 = 'rgba(255, 255, 255, 0.2)';
      }

      // 1. Render Wave Layer 3 (Treble / Micro-waves)
      ctx.beginPath();
      ctx.strokeStyle = waveColor3;
      ctx.lineWidth = 1.5;
      for (let x = 0; x < width; x++) {
        // Compose multiple sine-wave harmonics
        const bassFreq = 0.003;
        const midFreq = 0.012;
        const trebleFreq = 0.045;

        // Amplitude modulated by frequency and phase
        const y =
          centerY +
          Math.sin(x * bassFreq + phase.current * 0.4) * (bassAmp * 0.3) +
          Math.sin(x * midFreq - phase.current * 0.8) * (midAmp * 0.4) +
          Math.sin(x * trebleFreq + phase.current * 1.5) * (trebleAmp * 1.1);

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 2. Render Wave Layer 2 (Mids / Harmonics)
      ctx.beginPath();
      ctx.strokeStyle = waveColor2;
      ctx.lineWidth = 2.5;
      for (let x = 0; x < width; x++) {
        const bassFreq = 0.005;
        const midFreq = 0.018;

        const y =
          centerY +
          Math.sin(x * bassFreq - phase.current * 0.6) * (bassAmp * 0.6) +
          Math.cos(x * midFreq + phase.current * 1.0) * (midAmp * 0.8) +
          Math.sin(x * 0.035 - phase.current * 1.2) * (trebleAmp * 0.4);

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 3. Render Wave Layer 1 (Bass Core / Heavy Outline)
      ctx.beginPath();
      ctx.strokeStyle = waveColor1;
      ctx.lineWidth = 4.0;
      for (let x = 0; x < width; x++) {
        const bassFreq = 0.007;

        // Environment multiplier for concert hall echo, street attenuation
        const envMultiplier = soundProfile.environment === 'concert' ? 1.3 : 1.0;

        const y =
          centerY +
          Math.sin(x * bassFreq + phase.current * 1.0) * (bassAmp * envMultiplier) +
          Math.sin(x * 0.015 - phase.current * 0.5) * (midAmp * 0.5) +
          Math.cos(x * 0.04 + phase.current * 2.0) * (trebleAmp * 0.2);

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 4. Update Decibel levels realistically
      if (isPlaying) {
        setDbLevels({
          left: Math.round(-3 + Math.sin(phase.current * 3.5) * 4 + (soundProfile.bass / 100) * 3),
          right: Math.round(-3.5 + Math.cos(phase.current * 4.2) * 4.5 + (soundProfile.treble / 100) * 2),
        });
      } else {
        // Slow natural hum
        setDbLevels({
          left: Math.max(-45, Math.round(-24 + Math.sin(phase.current) * 1.5)),
          right: Math.max(-45, Math.round(-25 + Math.cos(phase.current) * 1.5)),
        });
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [soundProfile, isPlaying]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div
      id="acoustic-studio-container"
      className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 text-white relative z-10"
    >
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-white/50 uppercase block mb-1">
            Studio Calibration
          </span>
          <h2 className="font-sans font-extrabold text-2xl text-white flex items-center gap-2">
            <Volume2 className="w-6 h-6 text-indigo-400 animate-pulse" />
            Acoustic Studio Lab
          </h2>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'balanced', label: 'Reference' },
            { id: 'bass_boost', label: 'Bass Shelf' },
            { id: 'studio_reference', label: 'Engineer Mids' },
            { id: 'acoustic_live', label: 'Vocal Presence' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className={`text-[10px] font-mono font-bold tracking-wider uppercase px-3 py-1.5 rounded-full border transition-all ${
                activePreset === preset.id
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                  : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30 hover:bg-white/10'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Real-Time Waveform Visualizer Screen */}
        <div className="lg:col-span-7 bg-black/40 rounded-2xl p-5 shadow-inner border border-white/10 flex flex-col justify-between h-[360px]">
          {/* Top Info Bar */}
          <div className="flex justify-between items-center pb-3 border-b border-white/10 font-mono text-[10px] text-white/40">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-500 animate-ping' : 'bg-white/30'}`} />
              <span>{isPlaying ? 'ACOUSTIC FEEDBACK: ENGAGED' : 'SYSTEM SLEEP / IDLE'}</span>
            </div>
            <span>DSP RESPLENDOR V1.4</span>
          </div>

          {/* Central Waveform Canvas */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden py-4">
            <canvas ref={canvasRef} className="w-full h-full block" />

            {!isPlaying && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center transition-all">
                <button
                  onClick={togglePlayback}
                  className="flex items-center gap-2 bg-indigo-600 text-white font-mono text-xs font-bold px-4 py-2.5 rounded-full shadow-lg border border-indigo-400/30 hover:scale-105 transition-transform"
                >
                  <Music className="w-3.5 h-3.5" />
                  Simulate Live Stream
                </button>
              </div>
            )}
          </div>

          {/* Bottom Diagnostics / dB Meters */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10 font-mono text-[10px]">
            {/* Left Channel Level */}
            <div>
              <div className="flex justify-between text-white/60 mb-1">
                <span>CH L LEVEL</span>
                <span className={isPlaying ? 'text-indigo-400 font-bold' : 'text-white/40'}>
                  {dbLevels.left} dB
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-75"
                  style={{ width: `${Math.max(5, ((dbLevels.left + 45) / 45) * 100)}%` }}
                />
              </div>
            </div>

            {/* Right Channel Level */}
            <div>
              <div className="flex justify-between text-white/60 mb-1">
                <span>CH R LEVEL</span>
                <span className={isPlaying ? 'text-indigo-400 font-bold' : 'text-white/40'}>
                  {dbLevels.right} dB
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-75"
                  style={{ width: `${Math.max(5, ((dbLevels.right + 45) / 45) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Equalizer Knobs/Sliders and DSP Modes */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="font-sans font-bold text-sm text-white mb-4 flex items-center gap-1.5">
              <Sliders className="w-4.5 h-4.5 text-indigo-400" />
              Direct Parametric Equalizer
            </h3>

            {/* Equalizer sliders */}
            <div className="space-y-4">
              {/* Bass slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5 font-mono text-xs">
                  <span className="font-bold text-white/80">LFE Bass (60Hz)</span>
                  <span className="text-white/50 font-medium">
                    {Math.round((soundProfile.bass - 50) * 0.24).toFixed(1)} dB
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={soundProfile.bass}
                    onChange={(e) => handleSliderChange('bass', parseInt(e.target.value))}
                    className="flex-1 accent-indigo-500 cursor-pointer h-1.5 bg-white/10 rounded-lg outline-hidden"
                  />
                  <span className="text-[10px] font-mono font-bold text-white/40 w-6 text-right">
                    {soundProfile.bass}%
                  </span>
                </div>
              </div>

              {/* Mids slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5 font-mono text-xs">
                  <span className="font-bold text-white/80">Mid-Presence (1.2kHz)</span>
                  <span className="text-white/50 font-medium">
                    {Math.round((soundProfile.mid - 50) * 0.24).toFixed(1)} dB
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={soundProfile.mid}
                    onChange={(e) => handleSliderChange('mid', parseInt(e.target.value))}
                    className="flex-1 accent-indigo-500 cursor-pointer h-1.5 bg-white/10 rounded-lg outline-hidden"
                  />
                  <span className="text-[10px] font-mono font-bold text-white/40 w-6 text-right">
                    {soundProfile.mid}%
                  </span>
                </div>
              </div>

              {/* Treble slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5 font-mono text-xs">
                  <span className="font-bold text-white/80">Treble Detail (8.5kHz)</span>
                  <span className="text-white/50 font-medium">
                    {Math.round((soundProfile.treble - 50) * 0.24).toFixed(1)} dB
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={soundProfile.treble}
                    onChange={(e) => handleSliderChange('treble', parseInt(e.target.value))}
                    className="flex-1 accent-indigo-500 cursor-pointer h-1.5 bg-white/10 rounded-lg outline-hidden"
                  />
                  <span className="text-[10px] font-mono font-bold text-white/40 w-6 text-right">
                    {soundProfile.treble}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Environmental Sound attenuation algorithms */}
          <div className="mt-6 border-t border-white/10 pt-5">
            <h4 className="font-sans font-bold text-sm text-white mb-3">
              Environmental Sound Profile
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: 'studio',
                  label: 'Pure Studio',
                  desc: 'Uncompromised Flat Response',
                  color: 'border-white/10 hover:border-indigo-400/50 hover:bg-white/5',
                  activeColor: 'border-indigo-500 bg-indigo-500/20 text-white',
                },
                {
                  id: 'concert',
                  label: 'Concert Hall',
                  desc: 'Enriched Warm Spatial Echo',
                  color: 'border-white/10 hover:border-purple-400/50 hover:bg-white/5',
                  activeColor: 'border-purple-500 bg-purple-500/20 text-white',
                },
                {
                  id: 'ambient',
                  label: 'Active ANC Shield',
                  desc: 'Simulated Ambient Cancellation',
                  color: 'border-white/10 hover:border-teal-400/50 hover:bg-white/5',
                  activeColor: 'border-teal-500 bg-teal-500/20 text-white',
                },
              ].map((env) => {
                const isActive = soundProfile.environment === env.id;
                return (
                  <button
                    key={env.id}
                    onClick={() => handleEnvironmentChange(env.id as any)}
                    className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                      isActive ? env.activeColor : `${env.color} bg-white/5`
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight mb-1">{env.label}</span>
                    <span className="text-[9px] text-white/40 font-medium leading-normal block">
                      {env.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive simulator controls */}
          {isPlaying && (
            <div className="mt-4 flex items-center justify-between bg-indigo-950/20 border border-indigo-500/20 p-3 rounded-xl">
              <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-white/80">
                <AudioLines className="w-4 h-4 text-emerald-500 animate-bounce-subtle" />
                Preview streaming active
              </span>
              <button
                onClick={togglePlayback}
                className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-red-300 hover:text-red-200 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 px-2.5 py-1 rounded-md"
              >
                Mute Preview
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
