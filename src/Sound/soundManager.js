export default class SoundManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.buffers = {};
        this.activeMusicSources = {};
        this.volume = {
            music: 0.5,
            effects: 1.0,
        };

        // Zwei getrennte Gain-Nodes
        this.musicGain = this.audioContext.createGain();
        this.effectsGain = this.audioContext.createGain();
        this.musicGain.gain.value = this.volume.music;
        this.effectsGain.gain.value = this.volume.effects;

        // Beide gehen direkt an die Audio-Ausgabe
        this.musicGain.connect(this.audioContext.destination);
        this.effectsGain.connect(this.audioContext.destination);
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

    // Soundeffekte abspielen (kurz, kein Loop)
    playEffect(name) {
        const buffer = this.buffers[name];
        if (buffer) {
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.effectsGain);
            source.start();
        } else {
            console.warn(`Effekt '${name}' nicht gefunden.`);
        }
    }

    // Musik abspielen (looped)
    playMusic(name) {
        const buffer = this.buffers[name];
        if (buffer) {
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            source.connect(this.musicGain);
            source.start();
            this.activeMusicSources[name] = source;
        } else {
            console.warn(`Musik '${name}' nicht gefunden.`);
        }
    }

    stopMusic(name) {
        const source = this.activeMusicSources[name];
        if (source) {
            source.stop();
            delete this.activeMusicSources[name];
        }
    }

    setMusicVolume(value) {
        this.volume.music = Math.min(Math.max(value, 0), 1);
        this.musicGain.gain.value = this.volume.music;
    }

    getMusicVolume() {
        return this.volume.music;
    }

    setEffectsVolume(value) {
        this.volume.effects = Math.min(Math.max(value, 0), 1);
        this.effectsGain.gain.value = this.volume.effects;
    }

    getEffectsVolume() {
        return this.volume.effects;
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