window.GameAudio = (() => {
    let context;
    let master;
    let timer;
    let track = 'home';
    let enabled = true;
    let step = 0;
    const tracks = {
        home: { notes: [261.63, 329.63, 392, 523.25], tempo: 900 },
        newgame: { notes: [329.63, 392, 493.88, 659.25], tempo: 520 },
        battle: { notes: [146.83, 174.61, 220, 261.63, 220, 174.61], tempo: 360 }
    };

    function ensure() {
        if (context) return;
        context = new (window.AudioContext || window.webkitAudioContext)();
        master = context.createGain();
        master.gain.value = .045;
        master.connect(context.destination);
    }

    function tone(frequency, duration) {
        if (!enabled) return;
        ensure();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = track === 'battle' ? 'sawtooth' : 'triangle';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(.0001, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(.16, context.currentTime + .02);
        gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + duration);
        oscillator.connect(gain).connect(master);
        oscillator.start();
        oscillator.stop(context.currentTime + duration + .03);
    }

    function loop() {
        if (!enabled) return;
        const current = tracks[track];
        tone(current.notes[step % current.notes.length], Math.min(.42, current.tempo / 1000 * .75));
        step += 1;
        timer = window.setTimeout(loop, current.tempo);
    }

    return {
        play(nextTrack) {
            track = tracks[nextTrack] ? nextTrack : 'home';
            step = 0;
            window.clearTimeout(timer);
            if (!enabled) return;
            ensure();
            context.resume();
            loop();
        },
        toggle() {
            enabled = !enabled;
            if (enabled) this.play(track); else window.clearTimeout(timer);
            return enabled;
        },
        isEnabled() { return enabled; }
    };
})();
