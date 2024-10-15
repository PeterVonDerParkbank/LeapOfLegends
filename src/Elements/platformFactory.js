import Platform from './platform.js';
import MovingPlatform from './movingPlatform.js';
import BreakingPlatform from './breakingPlatform.js';

export default class PlatformFactory {
    static createPlatform(type, x, y, width, height) {
        switch (type) {
            case 'moving':
                return new MovingPlatform(x, y, width, height);
            case 'breaking':
                return new BreakingPlatform(x, y, width, height);
            case 'normal':
            default:
                return new Platform(x, y, width, height);
        }
    }
}