import Monster from './monster.js';

export default class MonsterFactory {
    static createMonster(platform) {
        // Position monster on the platform
        const monsterWidth = 70;
        const monsterHeight = 60;
        const x = platform.x + (platform.width - monsterWidth) / 2;
        const y = platform.y - monsterHeight;
        
        return new Monster(x, y, monsterWidth, monsterHeight, platform);
    }
}