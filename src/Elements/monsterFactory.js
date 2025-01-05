import Monster from './monster.js';

export default class MonsterFactory {
    static createMonster(platform, canvas, platforms) {
        // Position monster on the platform
        const monsterWidth = 70;
        const monsterHeight = 60;
        const minBoundary = 20;

        const leftZone = {
            start: minBoundary,
            end: platform.x - monsterWidth
        };
        
        const rightZone = {
            start: platform.x + platform.width,
            end: canvas.width - monsterWidth - minBoundary
        };

        let x;
        const canSpawnLeft = leftZone.end - leftZone.start >= monsterWidth;
        const canSpawnRight = rightZone.end - rightZone.start >= monsterWidth;


        if (canSpawnLeft && canSpawnRight) {
            // Choose random zone
            const useLeftZone = Math.random() < 0.5;
            const zone = useLeftZone ? leftZone : rightZone;
            x = zone.start + Math.random() * (zone.end - zone.start);
        } else if (canSpawnLeft) {
            x = leftZone.start + Math.random() * (leftZone.end - leftZone.start);
        } else if (canSpawnRight) {
            x = rightZone.start + Math.random() * (rightZone.end - rightZone.start);
        } else {
            // No valid spawn zones, don't spawn monster
            return null;
        }
        
        const y = platform.y - monsterHeight;
        //check if monster overlaps with any platforms or other monsters
        const buffer = 5; // 5 pixel buffer
        const isOverlapping = platforms.some(platform => {
            return x < (platform.x + platform.width + buffer) &&
                (x + monsterWidth + buffer) > platform.x &&
                y < (platform.y + platform.height + buffer) &&
                (y + monsterHeight + buffer) > platform.y;
        });

        if (isOverlapping) {
            return null;
        }
        return new Monster(x, y, monsterWidth, monsterHeight, platform);
    }
}