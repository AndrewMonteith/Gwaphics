/*
  Construction of Mountjoy House as seen here:
  https://www.google.com/maps/@54.7645956,-1.5723251,2a,75y,194.28h,83.81t/data=!3m6!1e1!3m4!1sQ33hJoKTtihha2HTjPOxJQ!2e0!7i13312!8i6656
*/

const bindEvents = (scene, shape) => {
  const onKeyDown = keyEvent => {
    switch (keyEvent.keyCode) {
      case 40: {
        shape.rotate(2, 0, 0);
        break;
      };
      case 38: {
        shape.rotate(-2, 0, 0)
        break;
      };
      case 39: {
        shape.rotate(0, 2, 0);
        break;
      };
      case 37: {
        shape.rotate(0, -2, 0);
        break;
      };
    }

    scene.draw();
  };

  document.addEventListener("keydown", onKeyDown);
};


/*
  Paneled window layer near the top of the building
*/
const buildGlassLayer = () => {
  const cornerWidths = 0.25;
  const buildCornerLayers = () => {
    const d = 4 - cornerWidths/2;

    return [
      cube([d, 2.975, d], [0.25, 1, 0.25], [0, 0, 1]),
      cube([-d, 2.975, d], [0.25, 1, 0.25], [0, 0, 1]),
      cube([d, 2.975, -d], [0.25, 1, 0.25], [0, 0, 1]),
      cube([-d, 2.975, -d], [0.25, 1, 0.25], [0, 0, 1])
    ]; 
  };
  
  const buildOtherPanels = () => { 
    const panels = [];

    const x0 = -3.5, z0 = 3.875;

    for (let i = 0; i < 15; ++i) {
      const horizontalOffset = x0 + 0.5*i;

      for (let j = 0; j < 4; ++j) {
        const rotation = j*90;

        panels.push(cube([horizontalOffset, 2.975, z0], [0.5, 1, 0.25], [0, 1, 0]).rotate(0, rotation, 0));
      }
    }
    
    return panels;  
  };

  return [
    ...buildCornerLayers(),
    ...buildOtherPanels(),
  ]
};


const buildRoofLayer = () => {
  const outsideRoofLayer = () => {
    const thickness = 0.3, length = 10.55;
    const d = 5 + thickness/2;
    return [
      cube([0, 3.555, d], [length, 0.15, thickness], [0, 0, 0]),
      cube([0, 3.555, -d], [length, 0.15, thickness], [0, 0, 0]),
      cube([0, 3.555, d], [length, 0.15, thickness], [0, 0, 0]).rotate(0, 90, 0),
      cube([0, 3.555, -d], [length, 0.15, thickness], [0, 0, 0]).rotate(0, 90, 0)
    ]
  }


  return [
    cube([0, 3.555, 0], [10, 0.15, 10], [0, 1, 1]),
    ...outsideRoofLayer()
  ]
}

/*
  Main layers of the building.
*/
const buildMainLayers = () => {
  return [
    cube([0, 0.375, 0], [8, 0.35, 8], [0.7, 0.7, 0.7]),
    cube([0, 1.1, 0], [8, 1.1, 8], [1, 0.7, 0.7]),
    cube([0, 1.725, 0], [8, 0.15, 8], [1, 0, 0]),
    cube([0, 1.875, 0], [8, 0.15, 8], [0, 1, 0]),
    cube([0, 2.145, 0], [8, 0.40, 8], [0.5, 0.5, 0.5]),
    cube([0, 2.4, 0], [8, 0.15, 8], [0.6, 0.6, 0.6]),
    ...buildGlassLayer(),
    ...buildRoofLayer()
  ];
};

const rowanHouse = () => {
  return [
    cube([0, 0, 0], [12, 0.35, 12], [0.5, 0.5, 0.5]).id("root").children(buildMainLayers())
  ];
}


const createScene = () => {
  // const [scene, idObjects] = buildScene(document.getElementById('webpageCanvas'),
  // [
  //   cube([0, 0, 0], [4, 4, 4], [1, 1, 1], 'res/sky.jpg').id("root").children([
  //     prism([0, 4, 0], [4, 4, 4], [1, 1, 1], 'res/slate.jpg')
  //   ])
  // ])

  const [scene, idObjects] = buildScene(document.getElementById('webpageCanvas'), rowanHouse());

  scene.loadTextures(['res/sky.jpg', 'res/slate.jpg']);
  bindEvents(scene, idObjects["root"]);

  return scene;
};

const scene = createScene();

const beginRendering = () => scene.draw();