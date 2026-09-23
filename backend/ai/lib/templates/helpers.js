// Shared TTS voiceover element
export function voiceover(text) {
  return {
    type: "voice",
    text: text || "",
    voice: "en-US-EmmaMultilingualNeural",
    duration: -2
  };
}
