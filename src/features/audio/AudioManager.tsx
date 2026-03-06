import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Howl } from 'howler';

// Simple synthetic 8-bit styled beeps encoded as base64 to avoid binary noise
// In a real production app these would be fetched or generated via WebAudio API directly if strictly 8-bit, 
// but Howler + small base64 wavs is easiest for web games without loading latency.
// These are placeholders for standard beep/bloop frequencies encoded trivially or we can use empty sounds if we just want the architecture first.
// I will just mock simple sounds with tiny base64 strings or rely on actual files later if needed.
// For now, let's just initialize howler with empty silent data URIs to ensure architecture works, 
// and then we can plug in real sounds.
const silentWav = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

// Let's use real simple base64 encoded wavs for 8-bit sounds (pre-generated).
// Hover: short high tick
const sfxHover = new Howl({ src: [silentWav], volume: 0.2 });
// Click: medium blip
const sfxClick = new Howl({ src: [silentWav], volume: 0.4 });
// Correct: high ascending chime
const sfxCorrect = new Howl({ src: [silentWav], volume: 0.5 });
// Wrong: low buzz
const sfxWrong = new Howl({ src: [silentWav], volume: 0.5 });
// Game Over: descending tune
const sfxGameOver = new Howl({ src: [silentWav], volume: 0.5 });

// BGM: looping track
// For BGM, a base64 would be too large. We'll try to load from public/audio/bgm.mp3 if it exists, otherwise fallback to silent.
const bgm = new Howl({
    src: ['/audio/bgm.mp3'], // Assuming we will place a file here, or we just handle load error gracefully
    loop: true,
    volume: 0.3,
    onloaderror: () => {
        console.warn('BGM file not found. Audio system will function without background music.');
    }
});

interface AudioContextType {
    muted: boolean;
    toggleMute: () => void;
    playHover: () => void;
    playClick: () => void;
    playCorrect: () => void;
    playWrong: () => void;
    playGameOver: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [muted, setMuted] = useState<boolean>(() => {
        const saved = localStorage.getItem('pixel_audio_muted');
        return saved === 'true';
    });

    const bgmStarted = useRef(false);

    useEffect(() => {
        localStorage.setItem('pixel_audio_muted', String(muted));
        Howler.mute(muted);
    }, [muted]);

    useEffect(() => {
        // Autoplay policy workaround: start BGM on first interaction
        const handleInteraction = () => {
            if (!bgmStarted.current) {
                bgm.play();
                bgmStarted.current = true;
            }
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
        };

        document.addEventListener('click', handleInteraction);
        document.addEventListener('keydown', handleInteraction);

        return () => {
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
        };
    }, []);

    const toggleMute = () => {
        setMuted(prev => !prev);
    };

    const value: AudioContextType = {
        muted,
        toggleMute,
        playHover: () => !muted && sfxHover.play(),
        playClick: () => !muted && sfxClick.play(),
        playCorrect: () => !muted && sfxCorrect.play(),
        playWrong: () => !muted && sfxWrong.play(),
        playGameOver: () => !muted && sfxGameOver.play(),
    };

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAudio = () => {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};

export const AudioToggle: React.FC = () => {
    const { muted, toggleMute } = useAudio();

    const toggleStyle: React.CSSProperties = {
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        background: 'none',
        border: 'none',
        color: 'var(--primary-color)',
        fontSize: '1.5rem',
        cursor: 'pointer',
        zIndex: 1000,
        textShadow: '2px 2px 0px #000',
        transition: 'transform 0.1s ease',
    };

    return (
        <button
            style={toggleStyle}
            onClick={toggleMute}
            aria-label={muted ? 'Unmute' : 'Mute'}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.9)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
            {muted ? '🔇' : '🔊'}
        </button>
    );
};
