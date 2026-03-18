import * as THREE from 'three';

export default class AudioHandler {
    constructor(scene, camera, path, listenerPosition = new THREE.Vector3(0, 0, 0)) {
        this.scene = scene;
        this.camera = camera;
        this.path = path;
        this.listenerPosition = listenerPosition;
        this.listener = new THREE.AudioListener();
        this.camera.add(this.listener);
        this.sounds = {};
        this.backgroundMusic = null;
        this.doorSound = null;
        this.userGestureStarted = false;
    }

    load(path) {
        const audioLoader = new THREE.AudioLoader();
        return new Promise((resolve, reject) => {
            audioLoader.load(path, (buffer) => {
                const audio = new THREE.Audio(this.listener);
                audio.setBuffer(buffer);
                resolve(audio);
            }, undefined, reject);
        });
    }

    async loadBackgroundMusic(musicPath, options = {}) {
        const { loop = true, volume = 0.35, autoplay = true } = options;
        
        try {
            // Ensure file path has extension
            const fullPath = musicPath.endsWith('.mp3') || musicPath.endsWith('.ogg') ? musicPath : `${musicPath}.mp3`;
            
            console.log('Loading background music from:', fullPath);
            
            this.backgroundMusic = await this.load(fullPath);
            this.backgroundMusic.setLoop(loop);
            this.backgroundMusic.setVolume(volume);
            
            console.log('Background music loaded successfully');
            
            if (autoplay) {
                if (this.listener.context.state === 'suspended') {
                    console.log('Audio context suspended, attempting to resume...');
                    await this.listener.context.resume();
                }
                
                try {
                    this.backgroundMusic.play();
                    console.log('Background music started automatically');
                    this.userGestureStarted = true;
                } catch (autoplayError) {
                    console.warn('Autoplay failed, waiting for user interaction:', autoplayError);
                    this._setupUserGestureStart();
                }
            }
            
            return this.backgroundMusic;
        } catch (error) {
            console.error('Failed to load background music:', error);
            throw error;
        }
    }

    _setupUserGestureStart() {
        const startMusic = () => {
            if (this.listener.context.state === 'suspended') {
                this.listener.context.resume();
            }
            if (this.backgroundMusic && !this.backgroundMusic.isPlaying) {
                this.backgroundMusic.play();
                console.log('Background music started on user gesture');
            }
            this.userGestureStarted = true;
        };
        
        window.addEventListener('click', startMusic, { once: true });
        window.addEventListener('keydown', startMusic, { once: true });
        window.addEventListener('touchstart', startMusic, { once: true });
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
            this.backgroundMusic.stop();
        }
    }

    setVolume(volume) {
        if (this.backgroundMusic) {
            this.backgroundMusic.setVolume(volume);
        }
    }

    async loadDoorSound(soundPath, options = {}) {
        const { volume = 0.5, loop = false } = options;
        
        try {
            const fullPath = soundPath.endsWith('.mp3') || soundPath.endsWith('.ogg') ? soundPath : `${soundPath}.mp3`;
            
            console.log('Loading door sound from:', fullPath);
            
            this.doorSound = await this.load(fullPath);
            this.doorSound.setLoop(loop);
            this.doorSound.setVolume(volume);
            
            console.log('Door sound loaded successfully');
            return this.doorSound;
        } catch (error) {
            console.error('Failed to load door sound:', error);
            throw error;
        }
    }

    playDoorSound() {
        if (!this.doorSound) {
            console.warn('Door sound not loaded yet');
            return;
        }
        
        // Resume audio context if suspended
        if (this.listener.context.state === 'suspended') {
            this.listener.context.resume();
        }
        
        // Stop if already playing and restart
        if (this.doorSound.isPlaying) {
            this.doorSound.stop();
        }
        
        this.doorSound.play();
        console.log('Door sound playing');
    }

    dispose() {
        this.stopBackgroundMusic();
        if (this.doorSound && this.doorSound.isPlaying) {
            this.doorSound.stop();
        }
        if (this.listener) {
            this.listener.context.close();
        }
    }

}