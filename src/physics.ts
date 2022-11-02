import { Vector3 } from "three";

export type PhysicsBody = {
    isKinematic: boolean;
    mass: number;
    aggregatedForce: Vector3;
    velocity: Vector3;
    position: Vector3;
}

export type PhysicsLink = {
    body1: PhysicsBody;
    body2: PhysicsBody;
    k: number;
}

export function mixBody<T extends new (...args: any[]) => { position: Vector3 }>(x: T) {
    return class extends x {
        isKinematic = false;
        mass = 1;
        aggregatedForce = new Vector3(0, 0, 0);
        velocity = new Vector3(0, 0, 0);
    };
}

const vectorPool = [
    new Vector3(),
    new Vector3(),
] as const;
export function physicsTick({
    dt, gravity, bodies, links,
}:{
    dt: number,
    gravity: Vector3,
    bodies: Iterable<PhysicsBody>,
    links: Iterable<PhysicsLink>,
}) {
    for (const body of bodies) {
        body.aggregatedForce.setScalar(0);
    }
    for (const body of bodies) {
        body.aggregatedForce.addScaledVector(gravity, body.mass);

        for (const b of bodies) {
            if (b === body) { continue; }
            const d = vectorPool[0];
            d.copy(b.position);
            d.sub(body.position);
            const r = d.length();

            // ball.aggregatedForce.addScaledVector(
            //     d, ball.mass * b.mass / (r * r * r));

            body.aggregatedForce.addScaledVector(
                d, - 10 / (r * r * r * r));
        }
    }
    for (const link of links) {
        const d = vectorPool[0];
        d.copy(link.body2.position);
        d.sub(link.body1.position);
        const r = d.length();

        link.body1.aggregatedForce.addScaledVector(d, link.k * r);
        link.body2.aggregatedForce.addScaledVector(d, -link.k * r);
    }
    for (const ball of bodies) {
        ball.aggregatedForce.addScaledVector(
            ball.velocity, -ball.velocity.length() * 0.1)
    }
    for (const ball of bodies) {
        if (ball.isKinematic) { continue; }
        ball.velocity.addScaledVector(ball.aggregatedForce, dt / ball.mass);
        ball.velocity.clampLength(0, 10);
        ball.position.addScaledVector(ball.velocity, dt);
    }
}