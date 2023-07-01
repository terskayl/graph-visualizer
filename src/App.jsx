import { useState, useEffect } from 'react'
import './App.css'
import {Engine, Render, Runner, Bodies, Body, Composite, Constraint, World} from 'matter-js'
import Matter from 'matter-js'

let didInit = false;
const engine = Engine.create()
let shapes = [],
constraints = [],
adj = [];


function App() {
  let [vertices, setVertices] = useState(20)
  
  const element = document.querySelector('#root');

  useEffect(() => {
    if (!didInit) {
      didInit = true;
      
      engine.gravity.y = 0;

      
      const render = Render.create({
          element,
          engine,
            options: {
              width: element.clientWidth,
              height: element.clientHeight,
              wireframes: false,
              background: 'transparent',
              pixelRatio: window.devicePixelRatio
            }
        });

      window.addEventListener('resize', () => { 
        render.bounds.max.x = element.clientWidth;
        render.bounds.max.y = element.clientHeight;
        render.options.width = element.clientWidth;
        render.options.height = element.clientHeight;
        render.canvas.width = element.clientWidth;
        render.canvas.height = element.clientHeight;
        Matter.Render.setPixelRatio(render, window.devicePixelRatio);
      });

      // walls
      Composite.add(engine.world, [
          Bodies.rectangle(element.clientWidth/2, 0, element.clientWidth, 50, { isStatic: true, restitution: 1, friction: 0 }),
          Bodies.rectangle(element.clientWidth/2, element.clientHeight, element.clientWidth, 50.5, { isStatic: true, restitution: 1, friction: 0 }),
          Bodies.rectangle(element.clientWidth, element.clientHeight/2, 50, element.clientHeight, { isStatic: true, restitution: 1, friction: 0 }),
          Bodies.rectangle(0, element.clientHeight/2, 50, element.clientWidth, { isStatic: true, restitution: 1, friction: 0 })
      ]);

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



      const numVertices = vertices;
      makeGraph(numVertices)
      



      Render.run(render);


      // Union Find
      let parents = new Array(shapes.length).fill(-1);

      function find(i) {
        let p = i;
        let counter = 0;
        while (parents[p] != -1) {
          p = parents[p]
          counter++;
        }
        return p;
      }
      function merge(i, j) {
        parents[find(i)] = find(j)
      }



      constraints.sort((a,b) => a.render.lineWidth - b.render.lineWidth);
      for (let index = 0; index < constraints.length; index++) {
        
        setTimeout( () => {
          World.remove(engine.world, constraints[index])
          constraints[index].render.strokeStyle = 'aqua'
          Composite.add(engine.world, constraints[index])
        }, 1000*index)
        let shape1 = find(shapes.findIndex(el => el == constraints[index].bodyA));
        let shape2 = find(shapes.findIndex(el => el == constraints[index].bodyB));
        
        if (shape1 !== shape2) {
          // setTimeout( () => {
          //   parents.filter(_, i => find(i) == shape1).forEach(i => {
          //     World.remove(engine.world, shapes[i])
          //     shapes[i].render.visible = false
          //     Composite.add(engine.world, shapes[i])
          //   })
          // }, 1000*index + 250)
          merge(shape1, shape2);

          setTimeout( () => {
          World.remove(engine.world, constraints[index])
          constraints[index].render.strokeStyle = 'black'
          Composite.add(engine.world, constraints[index])
          }, 1000*index + 500)
        }
      }



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
        const angle = Math.atan2(dy, dx);
        const force = { x: forceMagnitude * Math.cos(angle), y: forceMagnitude * Math.sin(angle) };
  
        Body.applyForce(bodyA, bodyA.position, { x: -force.x, y: -force.y });
        Body.applyForce(bodyB, bodyB.position, force);
    };
  
  
    // carry out contraction and repulsion
  
    for (let k = 0; k < 25; k++) {
        setTimeout( () => {
            for (let i = 0; i < vertices - 1; i++) {
                for (let j = i + 1; j < vertices; j++) {
                    applyGravity(shapes[i], shapes[j], 4);
                    if (adj[i] !== undefined && adj[i].indexOf(j) !== -1) {
                        applyContraction(shapes[i], shapes[j], -1.5)
                    }
                }
            }
        }, 500*k)
    }

    }
  }, [])
  

  
  function makeGraph(numVertices) {
    World.remove(engine.world, shapes)
    World.remove(engine.world, constraints)
    
    shapes = [],
    constraints = [],
    adj = [];



    
  for (let i = 0; i < numVertices; i++) {
      shapes[i] = Bodies.circle(Math.random()*element.clientWidth*0.75 + element.clientWidth*0.125, Math.random()*element.clientHeight*0.75 + element.clientHeight*0.125, Math.random()*20 + 10, {
          restitution: 0.6
      })
  }

  //make random edges

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

  for (let i = 1; i < shapes.length; i++) {
    if(adj[i] == null || adj[i].length == 0 || adj[i].sort((a,b) => a-b)[0] > i) {
      const j = Math.floor(i*Math.random());
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

  //add edges as constraints
  for (let i = 0; i < numVertices - 1; i++) {
      for (let j = i + 1; j < numVertices; j++) {
          if (adj[i] !== undefined && adj[i].indexOf(j) !== -1) {
              constraints[constraints.length] = Constraint.create({
                  bodyA: shapes[i],
                  bodyB: shapes[j],
                  length: 0.75 * Math.sqrt((shapes[i].position.x - shapes[j].position.x)**2 + (shapes[i].position.y - shapes[j].position.y)**2),
                  stiffness: 0.000000001,
                  label: 'hi',
                  render: {
                      type: 'line',
                      strokeStyle: 'gray',
                      lineWidth: 15 * Math.random() + 1
                  }
              })
          }
      }
  }
  Composite.add(engine.world, shapes);
  Composite.add(engine.world, constraints);

}

  useEffect(() => {
    alert(constraints.length)
    makeGraph(vertices)
  }, [vertices])
  
  



  return (
    <>
      <div id='controlPanel' className='opacity-75 d-absolute r-0 b-0'>
        <form onSubmit={e => {
          e.preventDefault();
          setVertices(e.target.elements['vertices'].value)
          }}>
          
          <span>5</span>
          <input type='range' className='formControl range' name='vertices' min='5' max='50'></input>
          <span>50</span>
          <input type='submit' className='btn submit-btn'></input>
        </form>  
      </div>
    </>
  )
}

export default App
