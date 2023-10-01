var _a;
export class AudioEffects {
    static addAudioElement(path) {
        let e = document.createElement('audio');
        e.src = path;
        e.setAttribute('preload', 'auto');
        e.setAttribute('controls', 'none');
        e.style.display = 'none';
        document.body.appendChild(e);
        return e;
    }
}
_a = AudioEffects;
AudioEffects.audioBoom = _a.addAudioElement('assets/boomBang.wav');
AudioEffects.audioBeep = _a.addAudioElement('assets/doubleBeep.wav');
