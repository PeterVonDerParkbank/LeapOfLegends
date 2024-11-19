export function playJumpAnimation(player) {
    player.dy = player.jumpStrength;
    player.isJumping = true;

    //set a timeout to end the jumpo animation after a short duration
    setTimeout(() => {
        player.isJumping = false;
    }, 200);
}