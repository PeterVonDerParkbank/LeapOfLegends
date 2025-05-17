import BreakingPlatform from '../Elements/breakingPlatform.js';
import TrapPlatform from '../Elements/trapPlatform.js';
import { playJumpAnimation } from './jumpAnimation.js';
import JumpPadPlatform from '../Elements/jumppadPlatform.js';
import { startSomersaultAnimation } from './somersaultAnimation.js';

export function checkCollision(player, platforms,soundManager) {
    let touchedTrap = false;
    for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i];

        if (platform.coin && !platform.coin.collected) {
            if (player.x < platform.coin.x + platform.coin.width &&
                player.x + player.width > platform.coin.x &&
                player.y < platform.coin.y + platform.coin.height &&
                player.y + player.height > platform.coin.y) {
                platform.coin.collected = true;
                player.coins++; // Increment coin counter
            }
        }
        
        if (player.dy > 0 && 
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height) {
            soundManager.play("jump");
            playJumpAnimation(player);
            if (platform instanceof BreakingPlatform) {
                platform.touch();
                platforms.splice(i, 1); // Remove the platform after touching it
            }
            if (platform instanceof JumpPadPlatform) {
                startSomersaultAnimation(player);
                player.dy = player.jumpStrength * 1.5; // Adjust the multiplier as needed
            }
            
            if (platform instanceof TrapPlatform) {
                platform.touch();
                touchedTrap = true;
            }
            return {platformY: platform.y, touchedTrap: touchedTrap};
        }
    }
    return {platformY: null, touchedTrap: touchedTrap};
}