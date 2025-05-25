// src/Gameplay/scrollLogic.js
import { generatePlatform, decrementTrapPlatformCount } from './platformLogic.js';
import TrapPlatform from '../Elements/trapPlatform.js';

export function calculateMaxPlatforms(score) {
    const initialMaxPlatforms = 20;
    const minPlatforms = 5;
    const scoreThreshold = 1000;
    const maxPlatforms = Math.max(minPlatforms, initialMaxPlatforms - Math.floor(score / scoreThreshold));
    return maxPlatforms;
}

export function scrollPlatforms(platforms, player, canvas, delta_time_multiplier, score) {
    // Ziel-Y-Position, wo der Spieler idealerweise angezeigt werden soll
    const targetY = player.isSomersaulting || player.jetpackActive
        ? canvas.height * 0.3  // Wenn spezieller Zustand → höheres Scroll-Ziel
        : canvas.height * 0.6; // Normalfall → Spieler eher unten anzeigen

    const distanceToScroll = targetY - player.y;

    const maxScrollSpeed = 11.5;
    const minScrollSpeed = 2;

    // Scroll-Geschwindigkeit abhängig von der Entfernung zum Zielbereich
    const scrollSpeed = Math.max(
        minScrollSpeed,
        Math.min(maxScrollSpeed, Math.abs(distanceToScroll) / 5) * delta_time_multiplier
    );

    const maxPlatforms = calculateMaxPlatforms(score);
    let scrolling = false;

    // Nur scrollen, wenn Spieler über dem Zielbereich ist oder Jetpack/Jumppad aktiv
    if (player.y < targetY || player.jetpackActive || player.isSomersaulting) {
        scrolling = true;

        platforms.forEach(platform => {
            platform.y += scrollSpeed;

            if (platform.jetpack) {
                platform.jetpack.y = platform.y - 30;
            }
            if (platform.monster) {
                platform.monster.y += scrollSpeed;
            }
            if (platform.coin) {
                platform.coin.y += scrollSpeed;
            }
        });

        // Spieler nach unten verschieben (Kameraeffekt)
        player.y += scrollSpeed;

        // Plattformen entfernen, die aus dem Bildschirm unten raus sind
        platforms = platforms.filter(p => {
            if (p.y >= canvas.height) {
                if (p instanceof TrapPlatform) {
                    decrementTrapPlatformCount();
                }
                if (p.monster) {
                    p.monster = null;
                }
                return false;
            }
            return true;
        });

        // Neue Plattform erzeugen, wenn nötig
        if (platforms.length < maxPlatforms) {
            console.log("NEW PLATFORM!!!!")
            const lastPlatform = platforms[platforms.length - 1];
            console.log(lastPlatform)
            if (!lastPlatform || lastPlatform.y > 0) {
                generatePlatform(platforms, player, canvas, score);
            }
        }
    }

    return { platforms, scrolling };
}