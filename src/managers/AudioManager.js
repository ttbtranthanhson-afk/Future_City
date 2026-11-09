import { AMBIENCE, MUSIC_PRESETS, SCENE_AUDIO } from '../data/audioConfig';
import { useExperience } from '../store/useExperience';

const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

class AudioManager {
  constructor() {
    this.ctx = null;
    this.ready = false;
    this.master = null;
    this.buses = {};
    this.verb = null;
    this.noise = null;
    this.musicState = null;
    this.ambienceState = null;
    this.eventTimers = [];
    this.eventLimits = [];
    this.duckTarget = 1;
    this.currentScene = null;
    this.initialized = false;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return true;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;
    try {
      this.ctx = new Ctx({ latencyHint: 'interactive' });
    } catch {
      return false;
    }
    const ctx = this.ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 22;
    comp.ratio.value = 3.2;
    comp.attack.value = 0.006;
    comp.release.value = 0.28;
    this.master.connect(comp);
    comp.connect(ctx.destination);

    this.buses = {};
    ['music', 'ambience', 'sfx', 'voice'].forEach((name) => {
      const g = ctx.createGain();
      g.gain.value = name === 'music' ? 0.3 : name === 'ambience' ? 0.4 : 0.6;
      g.connect(this.master);
      this.buses[name] = g;
      if (name !== 'voice') {
        const send = ctx.createGain();
        send.gain.value = name === 'music' ? 0.24 : 0.17;
        g.connect(send);
        if (!this.verbInput) {
          this.verbInput = ctx.createGain();
          this.verbInput.gain.value = 1;
        }
        send.connect(this.verbInput);
      }
    });

    this.verb = ctx.createConvolver();
    this.verb.buffer = this.makeImpulse(2.8, 2.4);
    const verbOut = ctx.createGain();
    verbOut.gain.value = 0.32;
    this.verbInput.connect(this.verb);
    this.verb.connect(verbOut);
    verbOut.connect(this.master);

    this.noise = this.makeNoise(4);
    this.initialized = true;
    this.ready = true;
    this.applySettings();
    this.ctx.onstatechange = () => {
      if (this.ctx.state === 'running') this.applySettings();
    };
    return true;
  }

  ensure() {
    if (!this.ctx) return this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ready;
  }

  makeImpulse(seconds, decay) {
    const ctx = this.ctx;
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * seconds);
    const buffer = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch += 1) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return buffer;
  }

  makeNoise(seconds = 3) {
    const ctx = this.ctx;
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch += 1) {
      const data = buffer.getChannelData(ch);
      let last = 0;
      for (let i = 0; i < length; i += 1) {
        const white = Math.random() * 2 - 1;
        last = last * 0.94 + white * 0.06;
        data[i] = (last * 2.2 + white * 0.4) * 0.5;
      }
    }
    return buffer;
  }

  applySettings() {
    if (!this.ctx || !this.master) return;
    const { volumes, muted } = useExperience.getState();
    const now = this.ctx.currentTime;
    const set = (node, value, tc = 0.08) => {
      if (node) node.gain.setTargetAtTime(Math.max(0.0001, value), now, tc);
    };
    set(this.master, (muted ? 0 : volumes.master) || 0.0001, 0.05);
    set(this.buses.music, volumes.music * this.duckTarget, 0.25);
    set(this.buses.ambience, volumes.ambience * this.duckTarget, 0.25);
    set(this.buses.sfx, volumes.sfx, 0.1);
    set(this.buses.voice, volumes.voice, 0.1);
  }

  duck(on) {
    this.duckTarget = on ? 0.34 : 1;
    this.applySettings();
  }

  setMuted() {
    this.applySettings();
  }

  panner(pan = 0) {
    if (!this.ctx.createStereoPanner) return null;
    const p = this.ctx.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, pan));
    return p;
  }

  connectOut(node, busName, pan = 0) {
    const bus = this.buses[busName] || this.buses.sfx;
    const p = this.panner(pan);
    if (p) {
      node.connect(p);
      p.connect(bus);
    } else {
      node.connect(bus);
    }
  }

  envelope(gainNode, peak, attack, hold, release, when = 0) {
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const g = gainNode.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(0.0001, t);
    g.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
    g.setValueAtTime(Math.max(0.0002, peak), t + attack + hold);
    g.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
  }

  tone({
    freq = 440,
    type = 'sine',
    dur = 0.5,
    attack = 0.01,
    gain = 0.15,
    pan = 0,
    bus = 'sfx',
    slideTo = null,
    filter = null,
    when = 0,
  }) {
    if (!this.ensure()) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
    const g = ctx.createGain();
    let head = osc;
    if (filter) {
      const f = ctx.createBiquadFilter();
      f.type = filter.type || 'lowpass';
      f.frequency.value = filter.freq || 1200;
      f.Q.value = filter.q || 0.7;
      osc.connect(f);
      head = f;
    }
    head.connect(g);
    this.connectOut(g, bus, pan);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  noiseBurst({
    dur = 0.4,
    freq = 1200,
    q = 0.7,
    gain = 0.15,
    pan = 0,
    bus = 'sfx',
    type = 'bandpass',
    when = 0,
    sweep = null,
  }) {
    if (!this.ensure()) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (sweep) f.frequency.exponentialRampToValueAtTime(Math.max(40, sweep), t + dur);
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + Math.min(0.08, dur * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f);
    f.connect(g);
    this.connectOut(g, bus, pan);
    src.start(t);
    src.stop(t + dur + 0.05);
  }

  /* ------------------------------------------------------------------ */
  /* MUSIC                                                              */
  /* ------------------------------------------------------------------ */

  startMusic(presetName, fade = 1.8) {
    this.stopMusic(Math.min(fade, 1.1));
    if (!this.ensure()) return;
    const preset = MUSIC_PRESETS[presetName] || MUSIC_PRESETS.home;
    const ctx = this.ctx;
    const out = ctx.createGain();
    out.gain.value = 0.0001;
    out.connect(this.buses.music);
    const state = {
      out,
      preset,
      barIndex: 0,
      timers: new Set(),
      stopped: false,
      sources: [],
    };
    this.musicState = state;
    out.gain.setTargetAtTime(preset.gain ?? 1, ctx.currentTime + 0.05, Math.max(0.35, fade / 2.6));
    this.scheduleBar(state, 0.4);
  }

  scheduleBar(state, delaySec = 0) {
    if (state.stopped) return;
    const preset = state.preset;
    const bar = preset.bar;
    const chord = preset.chords[state.barIndex % preset.chords.length];
    const instruments = preset.instruments || [];
    const timeAt = (this.ctx.currentTime + delaySec) - this.ctx.currentTime;
    const when = Math.max(0, timeAt);

    if (instruments.includes('pad') || instruments.includes('strings')) {
      this.playPad(state, chord, bar, when, instruments.includes('strings'));
    }
    if (instruments.includes('bass')) this.playBass(state, chord[0] - 12, bar, when);
    if (instruments.includes('piano') && state.barIndex % 2 === 0) {
      this.playPiano(state, chord[0] + 12, bar * 0.7, when + 0.1, 0.1);
      this.playPiano(state, chord[2] + 12, bar * 0.55, when + Math.min(1.2, bar * 0.3), 0.075);
    }
    if (instruments.includes('bell')) {
      this.playBell(state, chord[chord.length - 1] + 12, when + 0.2, 0.08);
    }
    if (instruments.includes('pulse')) this.playPulse(state, chord[0] + 12, when, 0.08);
    if (instruments.includes('perc')) this.playPercussion(state, preset, bar, when);

    if (instruments.includes('arp')) {
      const rate = preset.arpRate || 0.5;
      const count = Math.max(2, Math.floor(bar / rate));
      const scale = [...chord, chord[0] + (preset.arpOctave || 12), chord[1] + (preset.arpOctave || 12)];
      for (let i = 0; i < count; i += 1) {
        const note = scale[(i + state.barIndex) % scale.length] + (i % 4 === 3 ? 12 : 0);
        const delay = when + i * rate;
        const isPluck = (preset.instruments || []).includes('pluck');
        const timer = setTimeout(() => {
          if (state.stopped) return;
          if (isPluck) this.playPluck(state, note, 0.55, 0, rand(-0.35, 0.35), 0.1);
          else this.playArpNote(state, note, 0.7, 0, rand(-0.4, 0.4), 0.085);
        }, Math.max(0, delay * 1000));
        state.timers.add(timer);
      }
    }

    state.barIndex += 1;
    const t = setTimeout(() => {
      state.timers.delete(t);
      if (!state.stopped) this.scheduleBar(state, 0);
    }, Math.max(700, bar * 1000));
    state.timers.add(t);
  }

  playPad(state, chord, bar, when = 0, strings = false) {
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const style = state.preset.style;
    const types = style === 'dark' ? ['sawtooth', 'triangle'] : style === 'warp' ? ['sawtooth', 'sawtooth'] : ['triangle', 'sine'];
    chord.forEach((midi, idx) => {
      const freq = midiToFreq(midi);
      const noteGain = ctx.createGain();
      noteGain.gain.value = 0.0001;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = style === 'dark' ? 720 : style === 'soft' ? 1500 : style === 'warp' ? 1900 : 2300;
      filter.Q.value = 0.6;
      filter.connect(noteGain);
      noteGain.connect(state.out);
      const detunes = style === 'warp' ? [-14, 14] : [-6, 6];
      const oscs = types.map((type, oi) => {
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = freq * (strings && oi === 1 ? 2 : 1);
        osc.detune.value = detunes[oi] + rand(-3, 3);
        osc.connect(filter);
        osc.start(t);
        osc.stop(t + bar + 6);
        return osc;
      });
      state.sources.push(...oscs);
      const peak = (0.022 + (idx === 0 ? 0.012 : 0)) * (strings ? 1.25 : 1);
      noteGain.gain.setValueAtTime(0.0001, t);
      noteGain.gain.exponentialRampToValueAtTime(peak, t + rand(1.6, 2.8));
      noteGain.gain.setValueAtTime(peak, t + bar * 0.8);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, t + bar + rand(2.6, 4.2));
      if (style === 'warp') {
        const lfo = ctx.createOscillator();
        lfo.frequency.value = rand(0.3, 0.8);
        const lg = ctx.createGain();
        lg.gain.value = 8;
        lfo.connect(lg);
        lg.connect(oscs[0].detune);
        lfo.start(t);
        lfo.stop(t + bar + 4);
      }
    });
  }

  playBass(state, midi, bar, when = 0) {
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = midiToFreq(midi);
    const g = ctx.createGain();
    g.gain.value = 0.0001;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 260;
    osc.connect(f);
    f.connect(g);
    g.connect(state.out);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.8);
    g.gain.exponentialRampToValueAtTime(0.0001, t + bar + 1.2);
    osc.start(t);
    osc.stop(t + bar + 1.4);
    state.sources.push(osc);
  }

  playPiano(state, midi, dur, when = 0, gain = 0.09) {
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const freq = midiToFreq(midi);
    const g = ctx.createGain();
    g.gain.value = 0.0001;
    g.connect(state.out);
    [1, 2, 3].forEach((h, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.value = freq * h;
      osc.detune.value = rand(-4, 4);
      const hg = ctx.createGain();
      hg.gain.value = i === 0 ? 1 : i === 1 ? 0.32 : 0.12;
      osc.connect(hg);
      hg.connect(g);
      osc.start(t);
      osc.stop(t + dur + 1.4);
      state.sources.push(osc);
    });
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.006);
    g.gain.exponentialRampToValueAtTime(gain * 0.5, t + 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }

  playArpNote(state, midi, dur, when = 0, pan = 0, gain = 0.08) {
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = midiToFreq(midi);
    const p = this.panner(pan);
    const g = ctx.createGain();
    g.gain.value = 0.0001;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 3200;
    osc.connect(f);
    f.connect(g);
    if (p) {
      g.connect(p);
      p.connect(state.out);
    } else g.connect(state.out);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.1);
    state.sources.push(osc);
  }

  playPluck(state, midi, dur, when = 0, pan = 0, gain = 0.09) {
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const freq = midiToFreq(midi);
    const p = this.panner(pan);
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 1.5;
    f.frequency.setValueAtTime(freq * 4, t);
    f.frequency.exponentialRampToValueAtTime(freq * 1.6, t + dur * 0.8);
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq * 1.012, t);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.12);
    osc.connect(f);
    f.connect(g);
    if (p) {
      g.connect(p);
      p.connect(state.out);
    } else g.connect(state.out);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.1);
    state.sources.push(osc);
  }

  playBell(state, midi, when = 0, gain = 0.08) {
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const freq = midiToFreq(midi);
    const g = ctx.createGain();
    g.gain.value = 0.0001;
    g.connect(state.out);
    [1, 2.76, 5.4].forEach((h, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq * h;
      const hg = ctx.createGain();
      hg.gain.value = i === 0 ? 1 : i === 1 ? 0.35 : 0.18;
      osc.connect(hg);
      hg.connect(g);
      osc.start(t);
      osc.stop(t + 4.5);
      state.sources.push(osc);
    });
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 4.2);
  }

  playPulse(state, midi, when = 0, gain = 0.08) {
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = midiToFreq(midi);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.value = 0.0001;
    osc.connect(f);
    f.connect(g);
    g.connect(state.out);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.start(t);
    osc.stop(t + 0.6);
    state.sources.push(osc);
  }

  playPercussion(state, preset, bar, when = 0) {
    const ctx = this.ctx;
    const beats = 4;
    const step = bar / beats;
    for (let i = 0; i < beats; i += 1) {
      const t = ctx.currentTime + when + i * step;
      if (i === 0 || i === 2) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(115, t);
        osc.frequency.exponentialRampToValueAtTime(42, t + 0.24);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(i === 0 ? 0.16 : 0.11, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
        osc.connect(g);
        g.connect(state.out);
        osc.start(t);
        osc.stop(t + 0.4);
        state.sources.push(osc);
      }
      if (i === 1 || i === 3) {
        const src = ctx.createBufferSource();
        src.buffer = this.noise;
        src.loop = true;
        const f = ctx.createBiquadFilter();
        f.type = 'highpass';
        f.frequency.value = 2300;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.045, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
        src.connect(f);
        f.connect(g);
        g.connect(state.out);
        src.start(t);
        src.stop(t + 0.25);
        state.sources.push(src);
      }
    }
    if (preset.instruments.includes('brass')) {
      const chord = preset.chords[state.barIndex % preset.chords.length];
      const t = ctx.currentTime + when;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = midiToFreq(chord[1]);
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(500, t);
      f.frequency.exponentialRampToValueAtTime(1600, t + 1.1);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.035, t + 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + bar * 0.92);
      osc.connect(f);
      f.connect(g);
      g.connect(state.out);
      osc.start(t);
      osc.stop(t + bar);
      state.sources.push(osc);
    }
  }

  stopMusic(fade = 1) {
    const state = this.musicState;
    if (!state) return;
    state.stopped = true;
    this.musicState = null;
    state.timers.forEach((t) => clearTimeout(t));
    state.timers.clear();
    if (this.ctx) {
      const now = this.ctx.currentTime;
      state.out.gain.cancelScheduledValues(now);
      state.out.gain.setTargetAtTime(0.0001, now, Math.max(0.05, fade / 3));
      setTimeout(() => {
        state.sources.forEach((s) => {
          try {
            s.stop();
          } catch {
            /* already stopped */
          }
        });
        try {
          state.out.disconnect();
        } catch {
          /* noop */
        }
      }, fade * 1000 + 2500);
    }
  }

  /* ------------------------------------------------------------------ */
  /* AMBIENCE                                                           */
  /* ------------------------------------------------------------------ */

  startAmbience(type, fade = 2.2) {
    this.stopAmbience(Math.min(fade, 1.2));
    if (!this.ensure()) return;
    const cfg = AMBIENCE[type] || AMBIENCE.room;
    const ctx = this.ctx;
    const out = ctx.createGain();
    out.gain.value = 0.0001;
    out.connect(this.buses.ambience);
    const state = { out, timers: new Set(), stopped: false, sources: [], type };
    this.ambienceState = state;
    out.gain.setTargetAtTime(cfg.gain, ctx.currentTime + 0.05, Math.max(0.4, fade / 2.8));

    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cfg.filter;
    filter.Q.value = cfg.q;
    const bed = ctx.createGain();
    bed.gain.value = 0.55;
    src.connect(filter);
    filter.connect(bed);
    bed.connect(out);
    src.start();
    state.sources.push(src);

    if (cfg.lfo) {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = cfg.lfo[0];
      const lg = ctx.createGain();
      lg.gain.value = cfg.lfo[1] * 0.4;
      lfo.connect(lg);
      lg.connect(bed.gain);
      lfo.start();
      state.sources.push(lfo);
    }

    const extras = cfg.extras || [];
    if (extras.includes('hum')) {
      [55, 110].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq + rand(-0.5, 0.5);
        const g = ctx.createGain();
        g.gain.value = i === 0 ? 0.02 : 0.008;
        osc.connect(g);
        g.connect(out);
        osc.start();
        state.sources.push(osc);
      });
    }
    if (extras.includes('waves')) {
      const src2 = ctx.createBufferSource();
      src2.buffer = this.noise;
      src2.loop = true;
      const f2 = ctx.createBiquadFilter();
      f2.type = 'bandpass';
      f2.frequency.value = 1200;
      f2.Q.value = 0.5;
      const g2 = ctx.createGain();
      g2.gain.value = 0.18;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.11;
      const lg = ctx.createGain();
      lg.gain.value = 0.12;
      lfo.connect(lg);
      lg.connect(g2.gain);
      src2.connect(f2);
      f2.connect(g2);
      g2.connect(out);
      src2.start();
      lfo.start();
      state.sources.push(src2, lfo);
    }
    if (extras.includes('rumble')) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 31;
      const g = ctx.createGain();
      g.gain.value = 0.035;
      osc.connect(g);
      g.connect(out);
      osc.start();
      state.sources.push(osc);
    }

    const scheduleLoop = (min, max, fn) => {
      const id = setTimeout(() => {
        state.timers.delete(id);
        if (state.stopped) return;
        fn();
        scheduleLoop(min, max, fn);
      }, rand(min, max));
      state.timers.add(id);
    };

    if (extras.includes('birds')) {
      scheduleLoop(3500, 9000, () => {
        const pan = rand(-0.8, 0.8);
        const base = rand(1900, 3200);
        const count = Math.floor(rand(2, 5));
        for (let i = 0; i < count; i += 1) {
          this.tone({
            freq: base * rand(0.9, 1.1),
            slideTo: base * rand(1.1, 1.35),
            duration: 0.09,
            dur: rand(0.06, 0.13),
            gain: 0.022,
            pan,
            bus: 'ambience',
            when: i * rand(0.07, 0.14),
          });
        }
      });
    }
    if (extras.includes('gulls')) {
      scheduleLoop(5000, 11000, () => {
        this.sfx('gull', { pan: rand(-0.9, 0.9), gain: 0.55 });
      });
    }
    if (extras.includes('bubbles')) {
      scheduleLoop(1200, 4000, () => {
        this.sfx('bubble', { pan: rand(-0.7, 0.7), gain: rand(0.25, 0.7) });
      });
    }
    if (extras.includes('whales')) {
      scheduleLoop(14000, 28000, () => {
        this.tone({
          freq: rand(80, 140),
          slideTo: rand(160, 230),
          dur: 3.4,
          attack: 1.2,
          gain: 0.03,
          pan: rand(-0.6, 0.6),
          bus: 'ambience',
        });
      });
    }
    if (extras.includes('traffic')) {
      scheduleLoop(2500, 6500, () => {
        this.noiseBurst({
          dur: rand(1.2, 2.6),
          freq: rand(260, 520),
          sweep: rand(160, 360),
          gain: 0.024,
          pan: rand(-0.9, 0.9),
          bus: 'ambience',
          type: 'lowpass',
        });
      });
    }
    if (extras.includes('leaves')) {
      const src3 = ctx.createBufferSource();
      src3.buffer = this.noise;
      src3.loop = true;
      const f3 = ctx.createBiquadFilter();
      f3.type = 'highpass';
      f3.frequency.value = 2800;
      const g3 = ctx.createGain();
      g3.gain.value = 0.04;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.09;
      const lg = ctx.createGain();
      lg.gain.value = 0.025;
      lfo.connect(lg);
      lg.connect(g3.gain);
      src3.connect(f3);
      f3.connect(g3);
      g3.connect(out);
      src3.start();
      lfo.start();
      state.sources.push(src3, lfo);
    }
    if (extras.includes('chatter') || extras.includes('crowd')) {
      const murmur = ctx.createBufferSource();
      murmur.buffer = this.noise;
      murmur.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = extras.includes('crowd') ? 780 : 620;
      f.Q.value = 2.2;
      const g = ctx.createGain();
      g.gain.value = extras.includes('crowd') ? 0.1 : 0.055;
      murmur.connect(f);
      f.connect(g);
      g.connect(out);
      murmur.start();
      state.sources.push(murmur);
      scheduleLoop(extras.includes('crowd') ? 5000 : 7000, 14000, () => {
        const pan = rand(-0.9, 0.9);
        this.noiseBurst({
          dur: rand(0.5, 1.4),
          freq: rand(500, 900),
          q: 3,
          gain: extras.includes('crowd') ? 0.055 : 0.03,
          pan,
          bus: 'ambience',
        });
      });
    }
    if (extras.includes('clanks')) {
      scheduleLoop(3000, 8000, () => {
        this.sfx('clank', { pan: rand(-0.8, 0.8), gain: rand(0.2, 0.5) });
      });
    }
    if (extras.includes('machinery')) {
      scheduleLoop(2500, 6000, () => {
        this.sfx('machine', { pan: rand(-0.6, 0.6), gain: rand(0.2, 0.45) });
      });
    }
    if (extras.includes('water')) {
      scheduleLoop(1800, 5000, () => {
        this.noiseBurst({
          dur: rand(0.6, 1.8),
          freq: rand(700, 1900),
          q: 0.8,
          gain: 0.04,
          pan: rand(-0.7, 0.7),
          bus: 'ambience',
        });
      });
    }
    if (extras.includes('softbeeps')) {
      scheduleLoop(5000, 11000, () => {
        this.sfx('medical_beep', { pan: rand(-0.6, 0.6), gain: rand(0.15, 0.35) });
      });
    }
    if (extras.includes('bell')) {
      scheduleLoop(16000, 30000, () => {
        this.sfx('bell_temple', { pan: rand(-0.5, 0.5), gain: rand(0.3, 0.6) });
      });
    }
    if (extras.includes('shimmer')) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = rand(1600, 2600);
      const g = ctx.createGain();
      g.gain.value = 0.006;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = rand(0.1, 0.3);
      const lg = ctx.createGain();
      lg.gain.value = 0.005;
      lfo.connect(lg);
      lg.connect(g.gain);
      osc.connect(g);
      g.connect(out);
      osc.start();
      lfo.start();
      state.sources.push(osc, lfo);
    }
    if (extras.includes('whoosh')) {
      scheduleLoop(4500, 9000, () => {
        this.sfx('whoosh', { pan: rand(-0.8, 0.8), gain: rand(0.15, 0.35) });
      });
    }
  }

  switchAmbience(type, fade = 1.8) {
    if (!this.ambienceState) {
      this.startAmbience(type, fade);
      return;
    }
    if (this.ambienceState.type === type) return;
    this.startAmbience(type, fade);
  }

  stopAmbience(fade = 1) {
    const state = this.ambienceState;
    if (!state) return;
    state.stopped = true;
    this.ambienceState = null;
    state.timers.forEach((t) => clearTimeout(t));
    state.timers.clear();
    if (this.ctx) {
      const now = this.ctx.currentTime;
      state.out.gain.cancelScheduledValues(now);
      state.out.gain.setTargetAtTime(0.0001, now, Math.max(0.05, fade / 3));
      setTimeout(() => {
        state.sources.forEach((s) => {
          try {
            s.stop();
          } catch {
            /* noop */
          }
        });
        try {
          state.out.disconnect();
        } catch {
          /* noop */
        }
      }, fade * 1000 + 800);
    }
  }

  /* ------------------------------------------------------------------ */
  /* SFX                                                                */
  /* ------------------------------------------------------------------ */

  sfx(name, opts = {}) {
    if (!this.ensure()) return;
    const pan = opts.pan ?? 0;
    const gain = opts.gain ?? 1;
    switch (name) {
      case 'click':
        this.tone({ freq: 880, slideTo: 1320, dur: 0.12, type: 'sine', gain: 0.08 * gain, pan });
        this.tone({ freq: 1760, dur: 0.08, type: 'sine', gain: 0.03 * gain, when: 0.02, pan });
        break;
      case 'hover':
        this.tone({ freq: 1320, dur: 0.05, type: 'sine', gain: 0.025 * gain, pan });
        break;
      case 'whoosh':
        this.noiseBurst({ dur: 0.7, freq: 2800, sweep: 250, type: 'bandpass', q: 0.8, gain: 0.16 * gain, pan });
        break;
      case 'camera_zoom':
        this.noiseBurst({ dur: 1.2, freq: 180, sweep: 2200, type: 'bandpass', q: 1.2, gain: 0.1 * gain, pan });
        break;
      case 'portal_open':
        this.tone({ freq: 90, slideTo: 220, dur: 1.6, type: 'sine', gain: 0.13 * gain, pan });
        this.tone({ freq: 440, slideTo: 880, dur: 1.2, type: 'triangle', gain: 0.05 * gain, pan });
        this.noiseBurst({ dur: 1.4, freq: 900, sweep: 2600, gain: 0.05 * gain, pan, type: 'bandpass' });
        break;
      case 'warp':
      case 'timewarp':
        this.noiseBurst({ dur: 2.6, freq: 300, sweep: 6000, type: 'bandpass', q: 1.4, gain: 0.18 * gain, pan });
        this.tone({ freq: 55, slideTo: 440, dur: 2.4, type: 'sawtooth', gain: 0.09 * gain, pan, filter: { type: 'lowpass', freq: 900 } });
        break;
      case 'riser':
        this.noiseBurst({ dur: 2.2, freq: 400, sweep: 4200, type: 'bandpass', q: 1, gain: 0.13 * gain });
        this.tone({ freq: 220, slideTo: 880, dur: 2.1, type: 'sawtooth', gain: 0.05 * gain, filter: { type: 'lowpass', freq: 1800 } });
        break;
      case 'boom':
        this.tone({ freq: 90, slideTo: 32, dur: 1.4, type: 'sine', gain: 0.35 * gain });
        this.noiseBurst({ dur: 1.2, freq: 220, type: 'lowpass', gain: 0.2 * gain });
        break;
      case 'robot_beep':
        this.tone({ freq: rand(880, 1320), dur: 0.09, type: 'square', gain: 0.035 * gain, pan, filter: { type: 'lowpass', freq: 2600 } });
        this.tone({ freq: rand(1320, 1760), dur: 0.07, type: 'square', gain: 0.025 * gain, pan, when: 0.11, filter: { type: 'lowpass', freq: 2600 } });
        break;
      case 'servo':
        this.tone({ freq: 140, slideTo: 380, dur: 0.28, type: 'sawtooth', gain: 0.03 * gain, pan, filter: { type: 'lowpass', freq: 700 } });
        break;
      case 'holo_on':
        this.tone({ freq: 660, slideTo: 1320, dur: 0.5, type: 'sine', gain: 0.04 * gain, pan });
        this.tone({ freq: 990, slideTo: 1980, dur: 0.4, type: 'triangle', gain: 0.03 * gain, pan, when: 0.05 });
        break;
      case 'scan':
        this.tone({ freq: 1200, slideTo: 300, dur: 0.9, type: 'triangle', gain: 0.035 * gain, pan });
        break;
      case 'medical_beep':
        this.tone({ freq: rand(760, 980), dur: 0.14, type: 'sine', gain: 0.045 * gain, pan });
        break;
      case 'door':
        this.noiseBurst({ dur: 0.7, freq: 420, type: 'lowpass', gain: 0.08 * gain, pan });
        this.tone({ freq: 220, slideTo: 110, dur: 0.5, type: 'sine', gain: 0.035 * gain, pan });
        break;
      case 'bubble':
        this.tone({ freq: rand(500, 1200), slideTo: rand(1200, 2200), dur: rand(0.08, 0.18), type: 'sine', gain: 0.05 * gain, pan });
        break;
      case 'turbine':
        this.noiseBurst({ dur: 2.4, freq: 220, q: 0.6, type: 'lowpass', gain: 0.07 * gain, pan });
        this.tone({ freq: 70, slideTo: 60, dur: 2, type: 'sine', gain: 0.03 * gain, pan });
        break;
      case 'train':
        this.noiseBurst({ dur: 2.8, freq: 300, sweep: 900, type: 'bandpass', gain: 0.1 * gain, pan });
        this.tone({ freq: 160, dur: 2.4, type: 'sawtooth', gain: 0.03 * gain, pan, filter: { type: 'lowpass', freq: 500 } });
        break;
      case 'car_pass':
        this.noiseBurst({ dur: 1.8, freq: 700, sweep: 2200, type: 'bandpass', q: 1.4, gain: 0.12 * gain, pan });
        this.tone({ freq: 90, slideTo: 240, dur: 1.5, type: 'sawtooth', gain: 0.03 * gain, pan, filter: { type: 'lowpass', freq: 600 } });
        break;
      case 'sonar':
        this.tone({ freq: 880, dur: 1.2, type: 'sine', gain: 0.05 * gain, pan });
        break;
      case 'chime':
        [880, 1320, 1760].forEach((f, i) => this.tone({ freq: f, dur: 1.4, type: 'sine', gain: 0.04 * gain, pan, when: i * 0.09 }));
        break;
      case 'data':
        for (let i = 0; i < 5; i += 1) {
          this.tone({ freq: rand(1200, 2200), dur: 0.05, type: 'square', gain: 0.016 * gain, pan, when: i * 0.06, filter: { type: 'lowpass', freq: 3000 } });
        }
        break;
      case 'paper':
        this.noiseBurst({ dur: 0.5, freq: 3200, q: 0.8, type: 'highpass', gain: 0.05 * gain, pan });
        break;
      case 'chair':
        this.tone({ freq: 120, slideTo: 80, dur: 0.3, type: 'triangle', gain: 0.035 * gain, pan });
        this.noiseBurst({ dur: 0.25, freq: 800, type: 'lowpass', gain: 0.03 * gain, pan });
        break;
      case 'footsteps':
        for (let i = 0; i < 3; i += 1) {
          this.noiseBurst({ dur: 0.12, freq: 320, type: 'lowpass', gain: 0.05 * gain, pan, when: i * 0.4 });
        }
        break;
      case 'clank':
        this.tone({ freq: rand(220, 460), dur: 0.5, type: 'square', gain: 0.04 * gain, pan, filter: { type: 'bandpass', freq: 900, q: 2 } });
        this.noiseBurst({ dur: 0.3, freq: 2200, gain: 0.04 * gain, pan });
        break;
      case 'machine':
        this.tone({ freq: rand(70, 110), dur: 1.4, type: 'sawtooth', gain: 0.05 * gain, pan, filter: { type: 'lowpass', freq: 320 } });
        this.noiseBurst({ dur: 1.2, freq: 500, type: 'lowpass', gain: 0.05 * gain, pan });
        break;
      case 'bell_temple':
        [523, 1046, 1568].forEach((f, i) => this.tone({ freq: f, dur: 5, type: 'sine', gain: (0.035 - i * 0.008) * gain, pan }));
        break;
      case 'gull':
        this.tone({ freq: rand(1400, 1800), slideTo: rand(900, 1200), dur: 0.38, type: 'sawtooth', gain: 0.022 * gain, pan, filter: { type: 'bandpass', freq: 1800, q: 3 } });
        this.tone({ freq: rand(1300, 1700), slideTo: rand(850, 1100), dur: 0.3, type: 'sawtooth', gain: 0.016 * gain, pan, when: 0.45, filter: { type: 'bandpass', freq: 1800, q: 3 } });
        break;
      case 'firework':
        this.tone({ freq: 120, slideTo: 40, dur: 0.8, type: 'sine', gain: 0.12 * gain, pan });
        this.noiseBurst({ dur: 1.4, freq: 1600, sweep: 400, type: 'bandpass', gain: 0.07 * gain, pan, when: 0.35 });
        break;
      case 'applause':
        for (let i = 0; i < 18; i += 1) {
          this.noiseBurst({ dur: rand(0.04, 0.12), freq: rand(1400, 3400), q: 1.4, type: 'bandpass', gain: rand(0.012, 0.03) * gain, pan: rand(-0.9, 0.9), when: rand(0, 1.8) });
        }
        break;
      case 'crowd':
        this.noiseBurst({ dur: 2.4, freq: 1000, q: 1.2, type: 'bandpass', gain: 0.08 * gain, pan });
        break;
      case 'shimmer':
        [1200, 1800, 2400].forEach((f, i) => this.tone({ freq: f, dur: 1.6, type: 'sine', gain: 0.014 * gain, pan, when: i * 0.14 }));
        break;
      case 'drum':
        this.tone({ freq: 190, slideTo: 70, dur: 0.45, type: 'sine', gain: 0.14 * gain, pan });
        break;
      case 'gong':
        [196, 392, 588].forEach((f, i) => this.tone({ freq: f, dur: 4, type: 'sine', gain: (0.04 - i * 0.01) * gain, pan }));
        break;
      default:
        this.tone({ freq: 660, dur: 0.14, type: 'sine', gain: 0.03 * gain, pan });
    }
  }

  /* ------------------------------------------------------------------ */
  /* SCENE / EVENT LIFECYCLE                                            */
  /* ------------------------------------------------------------------ */

  startScene(sceneId, fade = 2) {
    if (!this.ensure()) return;
    this.currentScene = sceneId;
    const cfg = SCENE_AUDIO[sceneId] || SCENE_AUDIO[1];
    this.startMusic(cfg.music, fade);
    this.startAmbience(cfg.ambience, fade);
    this.startEvents(cfg.events || []);
  }

  transition(nextSceneId = null, transition = null) {
    this.stopEvents();
    this.stopMusic(1.1);
    this.stopAmbience(1);
    const type = transition?.type;
    switch (type) {
      case 'portal':
        this.sfx('portal_open', { gain: 1.2 });
        this.sfx('whoosh', { gain: 1.1 });
        break;
      case 'warp':
        this.sfx('warp', { gain: 1.1 });
        this.sfx('riser', { gain: 0.7 });
        break;
      case 'light':
        this.sfx('chime', { gain: 1.2 });
        this.sfx('riser', { gain: 0.55 });
        break;
      case 'water':
        this.sfx('whoosh', { gain: 0.9 });
        this.sfx('bubble', { gain: 1.4, pan: rand(-0.5, 0.5) });
        break;
      case 'blur':
        this.sfx('whoosh', { gain: 0.8 });
        this.sfx('data', { gain: 1 });
        break;
      case 'dust':
        this.sfx('machine', { gain: 0.7 });
        this.sfx('whoosh', { gain: 0.5 });
        break;
      case 'rise':
        this.sfx('riser', { gain: 0.9 });
        break;
      case 'wide':
        this.sfx('whoosh', { gain: 0.9 });
        this.sfx('chime', { gain: 0.7 });
        break;
      case 'end':
        this.sfx('gong', { gain: 1.1 });
        break;
      default:
        this.sfx('whoosh', { gain: 0.8 });
    }
    // Pre-warm next scene can be handled here later.
    void nextSceneId;
  }

  startEvents(events = []) {
    this.stopEvents();
    events.forEach((ev) => {
      const [min, max] = ev.every || [4000, 9000];
      let count = 0;
      const limit = ev.max ?? Infinity;
      const tick = () => {
        if (count >= limit) return;
        const id = setTimeout(() => {
          this.eventTimers = this.eventTimers.filter((t) => t !== id);
          if (useExperience.getState().transitioning) {
            tick();
            return;
          }
          count += 1;
          this.sfx(ev.sound, {
            pan: ev.pan === 'random' ? rand(-0.85, 0.85) : ev.pan ?? 0,
            gain: (ev.gain ?? 1) * rand(0.8, 1.15),
          });
          if (count < limit) tick();
        }, rand(min, max));
        this.eventTimers.push(id);
      };
      tick();
    });
  }

  stopEvents() {
    this.eventTimers.forEach((t) => clearTimeout(t));
    this.eventTimers = [];
  }

  stopAll() {
    this.stopEvents();
    this.stopMusic(0.4);
    this.stopAmbience(0.4);
    this.currentScene = null;
  }
}

export const audioManager = new AudioManager();
