import MonsterFactory from '../Elements/monsterFactory.js';

export function updateMonsters(monsters, delta_time_multiplier) {
    monsters = monsters.filter(monster => !monster.isDead || performance.now() - monster.deathTime < 1000);
    monsters.forEach(monster => monster.update(delta_time_multiplier));
}

export function drawMonsters(monsters, ctx) {
    monsters.forEach(monster => monster.draw(ctx));
}

export function spawnMonster(platforms, monsters, score) {
    // Don't spawn too many monsters
    const maxMonsters = Math.min(3, Math.floor(score / 500));
    if (monsters.length >= maxMonsters) return;

    // Random spawn chance increases with score
    const spawnChance = Math.min(0.1, 0.02 + (score / 10000));
    
    if (Math.random() < spawnChance) {
        // Pick a random platform that doesn't already have a monster
        const availablePlatforms = platforms.filter(p => 
            !monsters.some(m => m.platform === p) && 
            !p.jetpack // Don't spawn on platforms with jetpacks
        );
        
        if (availablePlatforms.length > 0) {
            const randomPlatform = availablePlatforms[Math.floor(Math.random() * availablePlatforms.length)];
            monsters.push(MonsterFactory.createMonster(randomPlatform));
        }
    }
}

export function checkMonsterCollisions(player, monsters) {
    for (const monster of monsters) {
        const result = monster.checkCollision(player);
        if (result === 'hit') {
            return true; // Player dies
        } else if (result === 'killed') {
            // Add score bonus for killing monster
            return 'killed';
        }
    }
    return false;
}