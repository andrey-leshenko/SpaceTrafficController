export class AudioEffects {
    static audioBoom: HTMLAudioElement = this.addAudioElement('assets/boomBang.wav')
    static audioBeep: HTMLAudioElement = this.addAudioElement('assets/doubleBeep.wav')

    static addAudioElement(path: string): HTMLAudioElement{
        let e = document.createElement('audio')
        e.src = path
        e.setAttribute('preload', 'auto')
        e.setAttribute('controls', 'none')
        e.style.display = 'none'
        document.body.appendChild(e)
        return e
    }
}