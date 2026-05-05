/**
 * @file Physics simulation for floating assets in the EmptyState component.
 * Pure functions with no React dependencies — safe to import anywhere.
 */

/** Minimal asset metadata needed by the physics engine. */
export type AssetConfig = {
    left: number;
    top: number;
    size: number;
    delayMs?: number;
};

/** Mutable physics state for a single floating asset. */
export type PhysicsState = {
    x: number;
    y: number;
    spin: number;
    velocityX: number;
    velocityY: number;
    spinVelocity: number;
};

/**
 * Initialise physics states for every asset with random velocities.
 * @param configs - Asset layout metadata.
 */
export function createPhysicsStates(configs: readonly AssetConfig[]): PhysicsState[] {
    return configs.map((_, index) => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.056 + index * 0.0048;

        return {
            x: 0,
            y: 0,
            spin: 0,
            velocityX: Math.cos(angle) * speed,
            velocityY: Math.sin(angle) * speed,
            spinVelocity: (index % 2 === 0 ? 1 : -1) / (4500 + index * 313),
        };
    });
}

/**
 * Move every asset and reflect it off the stage boundaries.
 * @param states - Mutable physics states.
 * @param configs - Asset layout metadata (for bounds).
 * @param stageWidth - Width of the movement stage.
 * @param stageHeight - Height of the movement stage.
 * @param deltaTime - Milliseconds since last frame (capped).
 */
export function updatePhysics(
    states: PhysicsState[],
    configs: readonly AssetConfig[],
    stageWidth: number,
    stageHeight: number,
    deltaTime: number,
): void {
    states.forEach((state, index) => {
        const config = configs[index];
        const minX = -config.left;
        const maxX = stageWidth - config.left - config.size;
        const minY = -config.top;
        const maxY = stageHeight - config.top - config.size;

        state.spin = (state.spin + state.spinVelocity * deltaTime) % 1;
        state.x += state.velocityX * deltaTime;
        state.y += state.velocityY * deltaTime;

        if (state.x <= minX || state.x >= maxX) {
            state.x = Math.min(Math.max(state.x, minX), maxX);
            state.velocityX *= -1;
        }

        if (state.y <= minY || state.y >= maxY) {
            state.y = Math.min(Math.max(state.y, minY), maxY);
            state.velocityY *= -1;
        }
    });
}

/**
 * Resolve elastic collisions between overlapping asset pairs.
 * @param states - Mutable physics states.
 * @param configs - Asset layout metadata (for centre positions and radii).
 */
export function resolveCollisions(
    states: PhysicsState[],
    configs: readonly AssetConfig[],
): void {
    for (let first = 0; first < states.length; first += 1) {
        for (let second = first + 1; second < states.length; second += 1) {
            const firstConfig = configs[first];
            const secondConfig = configs[second];
            const firstState = states[first];
            const secondState = states[second];

            const firstCentreX = firstConfig.left + firstState.x + firstConfig.size / 2;
            const firstCentreY = firstConfig.top + firstState.y + firstConfig.size / 2;
            const secondCentreX = secondConfig.left + secondState.x + secondConfig.size / 2;
            const secondCentreY = secondConfig.top + secondState.y + secondConfig.size / 2;

            const deltaX = firstCentreX - secondCentreX;
            const deltaY = firstCentreY - secondCentreY;
            const collisionDistance = (firstConfig.size + secondConfig.size) * 0.34;
            const distanceSquared = deltaX * deltaX + deltaY * deltaY;

            if (distanceSquared <= 0 || distanceSquared >= collisionDistance * collisionDistance) {
                continue;
            }

            const distance = Math.sqrt(distanceSquared);
            const normalX = deltaX / distance;
            const normalY = deltaY / distance;
            const overlap = collisionDistance - distance;
            const relativeVelocityX = firstState.velocityX - secondState.velocityX;
            const relativeVelocityY = firstState.velocityY - secondState.velocityY;
            const velocityAlongNormal = relativeVelocityX * normalX + relativeVelocityY * normalY;

            firstState.x += normalX * overlap * 0.5;
            firstState.y += normalY * overlap * 0.5;
            secondState.x -= normalX * overlap * 0.5;
            secondState.y -= normalY * overlap * 0.5;

            if (velocityAlongNormal < 0) {
                firstState.velocityX -= velocityAlongNormal * normalX;
                firstState.velocityY -= velocityAlongNormal * normalY;
                secondState.velocityX += velocityAlongNormal * normalX;
                secondState.velocityY += velocityAlongNormal * normalY;
            }
        }
    }
}

/**
 * Clamp every asset to the stage bounds (safety net after collision resolution).
 * @param states - Mutable physics states.
 * @param configs - Asset layout metadata (for bounds).
 * @param stageWidth - Width of the movement stage.
 * @param stageHeight - Height of the movement stage.
 */
export function clampToBounds(
    states: PhysicsState[],
    configs: readonly AssetConfig[],
    stageWidth: number,
    stageHeight: number,
): void {
    states.forEach((state, index) => {
        const config = configs[index];
        const minX = -config.left;
        const maxX = stageWidth - config.left - config.size;
        const minY = -config.top;
        const maxY = stageHeight - config.top - config.size;

        state.x = Math.min(Math.max(state.x, minX), maxX);
        state.y = Math.min(Math.max(state.y, minY), maxY);
    });
}
