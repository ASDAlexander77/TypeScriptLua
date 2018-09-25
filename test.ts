function _initializeAudioContext() {
    try {
        if (this.canUseWebAudio) {
            this._audioContext = new AudioContext();
            this.masterGain = this._audioContext.createGain();
            this.masterGain.gain.value = 1;
            this.masterGain.connect(this._audioContext.destination);
            this._audioContextInitialized = true;
        }
    }
    catch (e) {
        this.canUseWebAudio = false;
    }
}