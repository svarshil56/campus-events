export const eventCoverDefaults = [
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop", // Concert Neon
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000&auto=format&fit=crop", // Festival
    "https://images.unsplash.com/photo-1540575861501-7c0011e7398a?q=80&w=1000&auto=format&fit=crop", // Tech Abstract
    "https://images.unsplash.com/photo-1514525253344-f21f00713a48?q=80&w=1000&auto=format&fit=crop", // Party/Dance
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1000&auto=format&fit=crop", // Retro Music
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1000&auto=format&fit=crop", // Seminar/Talk
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop", // Microphone
    "https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=1000&auto=format&fit=crop", // Lights
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1000&auto=format&fit=crop", // Club Night
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop", // Crowd
];

export const getRandomCover = () => {
    return eventCoverDefaults[Math.floor(Math.random() * eventCoverDefaults.length)];
};
