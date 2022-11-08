import {
    Mesh, Color, 
    MeshPhongMaterial,
    CylinderGeometry, SphereGeometry, IcosahedronGeometry,
    Group,
    MeshBasicMaterial,
} from "three";
import { substanceColors } from "./substanceColors";
import { mixAddTap } from "./utils/mixAddTap";
import { mixBody, PhysicsBody, PhysicsLink } from "./physics";
import { Upc, Xrm } from "./puzzle/terms";
import memoizee from "memoizee";


class Ball extends mixBody(mixAddTap(Mesh)) {
    geometry = new SphereGeometry();
    material = new class extends MeshPhongMaterial {
        shininess = 10000;
        transparent = true;
        opacity = 0.1;
    }();
    mass = 0.01;
    innerBall = this.addTap(new Mesh(
        new SphereGeometry(0.1),
        new class extends MeshPhongMaterial {
            shininess = 0;
            emissiveIntensity = 0.6;
        }()
    ))
}
export const getOrCreateBallFromCache = memoizee((key: any, i: number) => {
    const ball = new Ball();
    ball.position.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
    return ball;
}, {
    max: 1000,
});


class XrmBody extends mixBody(Mesh) {
    geometry = new IcosahedronGeometry(0.5);
    material = new class extends MeshPhongMaterial {
        shininess = 0;
        color = new Color(0xffaadd)
    }();
    mass = 0.02;
}
export const getOrCreateXrmBodyFromCache = memoizee((key: any, i: number) => {
    const x = new XrmBody();
    x.position.set(Math.random(), -i, Math.random());
    return x;
}, {
    max: 1000,
});

export const sceneForWorld = memoizee((cacheKey: any,
    world: {
        xrms: Xrm[];
        upi: Upc[];
    }) => {
    const scene = new (mixAddTap(Group))();

    const balls = world.upi.map((upc, i) => {
        const ball = scene.addTap(getOrCreateBallFromCache(cacheKey, i));
        ball.material.color.setStyle(substanceColors[upc.sid]);
        ball.innerBall.material.color.setStyle(substanceColors[upc.sid]);
        ball.innerBall.material.emissive.setStyle(substanceColors[upc.sid]);
        return ball;
    });
    balls[0].isKinematic = true;

    const links = [] as PhysicsLink[];

    const ensureLink = (ball: PhysicsBody, ball2: PhysicsBody) => {
        const existingLink = links.find(({ body1, body2 }) => (body2 === ball && body1 === ball2)
            || (body1 === ball && body2 === ball2));
        if (!existingLink) {
            const link = scene.addTap(new class extends Mesh {
                geometry = new CylinderGeometry();
                material = new class extends MeshBasicMaterial {
                    shininess = 0;
                    color = new Color(0xffffff);
                }();
                body1 = ball;
                body2 = ball2;
                onBeforeRender = () => {
                    link.position.copy(link.body1.position);
                    link.position.lerp(link.body2.position, 0.5);
                    link.lookAt(link.body1.position);
                    link.rotateX(Math.PI / 2);
                    const d = link.body1.position.distanceTo(link.body2.position);
                    link.scale.set(0.01, d, 0.01);
                };
                k = 0.05;
            }());
            link.onBeforeRender();
            links.push(link);
        }
    };

    for (let i = 0; i < balls.length; i++) {
        const upc = world.upi[i];
        for (const link of upc.links) {
            ensureLink(
                balls[world.upi.indexOf(link[0])],
                balls[world.upi.indexOf(link[1])]);
        }
    }

    function addXrmLink(x: PhysicsBody, ball: PhysicsBody) {
        const link = scene.addTap(new class extends Mesh {
            geometry = new CylinderGeometry();
            material = new class extends MeshPhongMaterial {
                shininess = 0;
                color = new Color(0xffaadd);
            }();
            body1 = ball;
            body2 = x;
            update() {
                this.position.copy(this.body1.position);
                this.position.lerp(this.body2.position, 0.5);
                this.lookAt(this.body1.position);
                this.rotateX(Math.PI / 2);
                const d = this.body1.position.distanceTo(this.body2.position);
                this.scale.set(0.03, d - 1, 0.03);
            }
            onBeforeRender = this.update.bind(this);
            k = 0.1;
        }());
        link.onBeforeRender();
        links.push(link);
    }

    const xrms = world.xrms.map((xrm, i) => {
        const x = scene.addTap(getOrCreateXrmBodyFromCache(cacheKey, i));
        if (xrm.arm.ox) { addXrmLink(x, balls[world.upi.indexOf(xrm.arm.ox)]); }
        if (xrm.brm.ox) { addXrmLink(x, balls[world.upi.indexOf(xrm.brm.ox)]); }
        if (xrm.crm.ox) { addXrmLink(x, balls[world.upi.indexOf(xrm.crm.ox)]); }
        return x;
    });


    const bodies = [...balls, ...xrms];

    return {
        scene, links, bodies
    };
});
