export function startSomersaultAnimation(player) {
    player.isSomersaulting = true;
    player.somersaultStartTime = performance.now();
    setTimeout(() => {
        player.isSomersaulting = false;
        dy = player.jumpStrength;
    }, 600);
};