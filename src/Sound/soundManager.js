// Sound Manager für das Jump-Spiel
export default class SoundManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.buffers = {};
        this.volume = 1.0; // Standardlautstärke (100%)
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.volume;
        this.gainNode.connect(this.audioContext.destination);
    }

    async addSound(name, src) {
        try {
            const response = await fetch(src);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.buffers[name] = audioBuffer;
            console.log(`Sound '${name}' geladen.`);
        } catch (error) {
            console.error(`Fehler beim Laden von Sound '${name}':`, error);
        }
    }

    play(name) {
        const buffer = this.buffers[name];
        if (buffer) {
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.gainNode);
            source.start();
        } else {
            console.warn(`Sound '${name}' nicht gefunden.`);
        }
    }

    setVolume(value) {
        this.volume = Math.min(Math.max(value, 0), 1); // Begrenze auf 0 bis 1
        this.gainNode.gain.value = this.volume;
    }

    getVolume() {
        return this.volume;
    }

    unlockAudio() {
        const unlock = () => {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
                console.log("Audio freigegeben");
            }
            window.removeEventListener('touchstart', unlock);
            window.removeEventListener('mousedown', unlock);
        };
        window.addEventListener('touchstart', unlock, { once: true });
        window.addEventListener('mousedown', unlock, { once: true });
    }
}