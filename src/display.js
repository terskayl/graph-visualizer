import Matter from "matter-js";

alert('jio');
document.addEventListener("DOMContentLoaded",() => {
    const Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Constraint = Matter.Constraint;

    const engine = Engine.create()

    const render = Render.create({
        element : document.querySelector('#root'),
        engine : engine
    })

    Composite.add(engine.world, [
        Bodies.rectangle(400, 0, 800, 50, { isStatic: true }),
        Bodies.rectangle(400, 600, 800, 50.5, { isStatic: true }),
        Bodies.rectangle(800, 300, 50, 600, { isStatic: true }),
        Bodies.rectangle(0, 300, 50, 600, { isStatic: true })
    ]);

    //Render.run(render);

    const runner = Runner.create();

    Runner.run(runner, engine);

    var mouse = Matter.Mouse.create(render.canvas),
        mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

    Composite.add(engine.world, mouseConstraint)

    render.mouse = mouse;

    engine.gravity.y = 0;

    const numVertices = 20;

    let shapes = [],
        constraints = [];

    for (let i = 0; i < numVertices; i++) {
        shapes[i] = Bodies.circle(Math.random()*600 + 100, Math.random()*400 + 100, Math.random()*20 + 10)
    }

    for (let i = 0; i < numVertices - 1; i++) {
        for (let j = i + 1; j < numVertices; j++) {
            // if (Math.random() < 0.1) {
            //     constraints[constraints.length] = Constraint.create({
            //         bodyA: shapes[i],
            //         bodyB: shapes[j],
            //         length: 0.75 * Math.sqrt((shapes[i].position.x - shapes[j].position.x)**2 + (shapes[i].position.y - shapes[j].position.y)**2),
            //         stiffness: 0.0001
            //     })
            // }
        }
    }
    let adj = [];
    for (let i = 0; i < shapes.length - 1; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
            if (Math.random() < 0.1){
                if (adj[i] == null) {
                    adj[i] = [];
                }
                if (adj[j] == null) {
                    adj[j] = [];
                }
                adj[i][adj[i].length] = j;
                adj[j][adj[j].length] = i;
            }
        }
    }


    // Define gravitational forces between bodies
    //const gravitationalConstant = 2;
    const applyGravity = (bodyA, bodyB, gravConstant) => {
        const gravitationalConstant = gravConstant
        const dx = bodyB.position.x - bodyA.position.x;
        const dy = bodyB.position.y - bodyA.position.y;
        const distanceSq = dx * dx + dy * dy;
        const forceMagnitude = (gravitationalConstant * bodyA.mass * bodyB.mass) / distanceSq;
        const angle = Math.atan2(dy, dx);
        const force = { x: forceMagnitude * Math.cos(angle), y: forceMagnitude * Math.sin(angle) };

        Body.applyForce(bodyA, bodyA.position, { x: -force.x, y: -force.y });
        Body.applyForce(bodyB, bodyB.position, force);
    };

    const applyContraction = (bodyA, bodyB, gravConstant) => {
        const gravitationalConstant = gravConstant
        const dx = bodyB.position.x - bodyA.position.x;
        const dy = bodyB.position.y - bodyA.position.y;
        const distanceSq = dx * dx + dy * dy;
        const forceMagnitude = distanceSq/100000000*(gravitationalConstant * bodyA.mass * bodyB.mass);
        //alert(forceMagnitude);
        const angle = Math.atan2(dy, dx);
        const force = { x: forceMagnitude * Math.cos(angle), y: forceMagnitude * Math.sin(angle) };

        Body.applyForce(bodyA, bodyA.position, { x: -force.x, y: -force.y });
        Body.applyForce(bodyB, bodyB.position, force);
    };



    for (let k = 0; k < 10; k++) {
        setTimeout( () => {
            for (let i = 0; i < numVertices - 1; i++) {
                for (let j = i + 1; j < numVertices; j++) {
                    applyGravity(shapes[i], shapes[j], 4);
                    if (adj[i] !== undefined && adj[i].indexOf(j) !== -1) {
                        applyContraction(shapes[i], shapes[j], -1)
                    }
                }
            }
        }, 5000*k)
    }




    Composite.add(engine.world, shapes);
    Composite.add(engine.world, constraints);
    alert(shapes.length)

    var canvas = document.querySelector('canvas');
    var context = canvas.getContext('2d');

    canvas.width = 800;
    canvas.height = 600;

    // document.querySelector('#root').appendChild(canvas);

    (function render() {
        var bodies = Composite.allBodies(engine.world);

        window.requestAnimationFrame(render);

        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.beginPath();

        for (var i = 0; i < bodies.length; i += 1) {
            var vertices = bodies[i].vertices;

            context.moveTo(vertices[0].x, vertices[0].y);

            for (var j = 1; j < vertices.length; j += 1) {
                context.lineTo(vertices[j].x, vertices[j].y);
            }

            context.lineTo(vertices[0].x, vertices[0].y);
        }

        for (let i = 0; i < shapes.length - 1; i++) {
            for (let j = i; j < shapes.length; j++) {
                 if (adj[i] !== undefined && adj[i].indexOf(j) !== -1){
                    context.moveTo(shapes[i].position.x, shapes[i].position.y);
                    context.lineTo(shapes[j].position.x, shapes[j].position.y);
                    // alert(shapes[i].position.x);
                 }
            }
        }

        context.lineWidth = 1;
        context.strokeStyle = '#999';
        context.stroke();
    })();


    // document.querySelector('canvas').addEventListener("mousedown", event => {
    //     const boxVar = Bodies.rectangle(event.x, event.y, 20, 20);
    //     Composite.add(engine.world, boxVar);
    // })
})

