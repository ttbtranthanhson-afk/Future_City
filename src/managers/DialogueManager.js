import { useExperience } from '../store/useExperience';
import { audioManager } from './AudioManager';

const synthAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;

function estimateMs(text) {
  return 2200 + text.replace(/\s+/g, ' ').length * 75;
}

function findEnglishVoice() {
  if (!synthAvailable) return null;
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => /^en([-_]|$)/i.test(v.lang)) || null;
}

class DialogueManager {
  constructor() {
    this.seq = 0;
    this.timer = null;
    this.safety = null;
    this.currentUtterance = null;
    this.voicesReady = false;
    this.cachedVoice = null;
    if (synthAvailable) {
      const load = () => {
        this.voicesReady = true;
        this.cachedVoice = findEnglishVoice();
      };
      load();
      window.speechSynthesis.addEventListener?.('voiceschanged', load);
    }
  }

  play(lines, delay = 1200) {
    this.cancel();
    if (!lines || !lines.length) return;
    const seq = ++this.seq;
    this.timer = setTimeout(() => this.run(seq, 0, lines), delay);
  }

  run(seq, index, lines) {
    if (seq !== this.seq) return;
    if (index >= lines.length) {
      audioManager.duck(false);
      return;
    }
    const line = lines[index];
    audioManager.duck(true);

    let advanced = false;
    const advance = () => {
      if (advanced || seq !== this.seq) return;
      advanced = true;
      clearTimeout(this.safety);
      const pause = line.pause ?? 700;
      this.timer = setTimeout(() => this.run(seq, index + 1, lines), pause);
    };

    const state = useExperience.getState();
    const useVoice =
      synthAvailable &&
      state.volumes.voice > 0.02 &&
      !state.muted &&
      (this.cachedVoice || findEnglishVoice());

    if (useVoice) {
      try {
        if (!this.cachedVoice) this.cachedVoice = findEnglishVoice();
        const utter = new SpeechSynthesisUtterance(line.text.replace(/—/g, ', '));
        utter.lang = 'en-US';
        if (this.cachedVoice) utter.voice = this.cachedVoice;
        utter.volume = state.volumes.voice;
        utter.rate = line.speaker === 'Robo' ? 1.08 : 0.97;
        utter.pitch = line.speaker === 'Robo' ? 1.35 : line.speaker === 'EVERYONE' ? 0.85 : 1;
        utter.onend = advance;
        utter.onerror = () => {
          if (!advanced) {
            this.safety = setTimeout(advance, estimateMs(line.text) + 1500);
          }
        };
        this.currentUtterance = utter;
        window.speechSynthesis.speak(utter);
        this.safety = setTimeout(advance, estimateMs(line.text) + 9000);
      } catch {
        this.safety = setTimeout(advance, estimateMs(line.text));
      }
    } else {
      this.safety = setTimeout(advance, estimateMs(line.text));
    }
  }

  cancel() {
    this.seq += 1;
    clearTimeout(this.timer);
    clearTimeout(this.safety);
    this.timer = null;
    this.safety = null;
    if (synthAvailable) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* noop */
      }
    }
    this.currentUtterance = null;
    audioManager.duck(false);
  }
}

export const dialogueManager = new DialogueManager();
