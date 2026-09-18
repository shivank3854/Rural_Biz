import { LANGS } from './i18n.js';

export function startListening(onResult, onEnd) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const rec = new SR();
  rec.interimResults = false;
  rec.onresult = (e) => {
    const text = e.results[0][0].transcript;
    onResult(text);
  };
  rec.onend = () => onEnd && onEnd();
  rec.onerror = () => onEnd && onEnd();
  return rec;
}

export function speak(text, langCode, onEnd) {
  if (!('speechSynthesis' in window)) return;
  const lang = (LANGS.find((l) => l.code === langCode) || LANGS[0]).speech;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  if (onEnd) utter.onend = onEnd;
  window.speechSynthesis.speak(utter);
}