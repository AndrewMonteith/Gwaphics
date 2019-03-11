/*
  Construction of Mountjoy House as seen here:
  https://www.google.com/maps/@54.7645956,-1.5723251,2a,75y,194.28h,83.81t/data=!3m6!1e1!3m4!1sQ33hJoKTtihha2HTjPOxJQ!2e0!7i13312!8i6656
*/

const makeModelMoveable = (scene, idObjects) => {
  const root = idObjects['root'];

  const keyCodes = {
    LeftArrow: 37,
    UpArrow: 38,
    RightArrow: 39,
    DownArrow: 40,

    Q: 81,
    E: 69,

    W: 87,
    S: 83,

    A: 65,
    D: 68
  }

  // Up Rotation: root.rotate(-angle, 0, 0)
  // Down Rotation: root.rotate(angle, 0, 0);

  const onKeyDown = keyEvent => {
    const angle = 5;
    const dPos = 0.5;
    switch (keyEvent.keyCode) {
      case keyCodes.W: {
        scene.offsetCameraPos(0, 0, -dPos);
        break;
      };
      case keyCodes.S: {
        scene.offsetCameraPos(0, 0, dPos);
        break;
      };
      case keyCodes.A: {
        scene.offsetCameraPos(-dPos, 0, 0);
        break;
      };
      case keyCodes.D: {
        scene.offsetCameraPos(dPos, 0, 0);
        break;
      };
      case keyCodes.Q: {
        scene.offsetCameraPos(0, dPos, 0);
        break;
      };
      case keyCodes.E: {
        scene.offsetCameraPos(0, -dPos, 0);
        break;
      };

      case keyCodes.LeftArrow: {
        root.rotate(0, -angle, 0);
        break;
      };
      case keyCodes.RightArrow: {
        root.rotate(0, angle, 0)
        break;
      };
      case keyCodes.UpArrow: {
        root.translate(0, 0, -1);
        break;
      };
      case keyCodes.DownArrow: {
        root.translate(0, 0, 1);
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
  const buildCornerWindows = () => {
    const d = 4 - cornerWidths/2;
    const createCorner = pos => cube(pos, [0.25, 1, 0.25], [0.6, 0.6, 0.6]).texture('res/window.jpg', 1, 1);

    return [
      createCorner([d, 2.975, d]),
      createCorner([-d, 2.975, d]),
      createCorner([d, 2.975, -d]),
      createCorner([-d, 2.975, -d])
    ]; 
  };
  
  const buildCentralWindows = () => { 
    const panels = [];

    const x0 = -3.5, z0 = 3.875;

    for (let i = 0; i < 15; ++i) {
      const horizontalOffset = x0 + 0.5*i;

      for (let rotation = 0; rotation < 360; rotation += 90) {
        panels.push(cube([horizontalOffset, 2.975, z0], [0.5, 1, 0.25], [0.6, 0.6, 0.6]).rotate(0, rotation, 0).texture('res/window.jpg'));
      }
    }
    
    return panels;  
  };

  return [
    ...buildCornerWindows(),
    ...buildCentralWindows(),
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
    cube([0, 3.555, 0], [10, 0.15, 10], [0.8, 0.8, 0.6]),
    ...outsideRoofLayer()
  ]
}

/*
  Main brick layers of the building.
*/
const buildMainLayers = () => [
    cube([0, 0.375, 0], [8, 0.35, 8], [1, 0.8, 0.6]).texture('res/redbrick.jpg', 8, 0.4),
    cube([0, 1.1, 0], [8, 1.1, 8], [1, 0.7, 0.7]).texture('res/yellowsandstone.jpg', 5, 1.2),
    cube([0, 1.725, 0], [8, 0.15, 8], [0.6, 0.5, 0.5]).texture('res/yellowsandstone.jpg', 4, 0.2),
    cube([0, 1.875, 0], [8, 0.15, 8], [1, 0.7, 0.7]).texture('res/yellowsandstone.jpg', 3.8, 0.2),
    cube([0, 2.145, 0], [8, 0.40, 8], [1, 0.8, 0.6]).texture('res/redbrick.jpg', 8, 0.4),
    cube([0, 2.4, 0], [8, 0.15, 8], [0.75, 0.75, 0.4]),
    ...buildGlassLayer(),
    ...buildRoofLayer()
];

/*
  Main entrace with the automatic doors
  Doors are animated to open and close
*/
const buildFrontEntrance = () => {
  const buildFrontDoor = () => {
    return [
      cube([-0.275, 0.8, 5.325], [0.545, 1.375, 0.1], [0.4, 0.4, 0.4]).id("leftDoor").texture("res/window.jpg").children([
        cube([0.175, 0, 0.1], [0.03, 0.25, 0.1], [1, 1, 1]),
        cube([0.14, 0, 0.135], [0.1, 0.25, 0.03], [1, 1, 1])
      ]),
      cube([0.275, 0.8, 5.325], [0.545, 1.375, 0.1], [0.4, 0.4, 0.4]).id("rightDoor").texture("res/window.jpg").children([
        cube([-0.175, 0, 0.1], [0.03, 0.25, 0.1], [1, 1, 1]),
        cube([-0.14, 0, 0.135], [0.1, 0.25, 0.03], [1, 1, 1])
      ]),
    ]
  }

  const buildSidePanels = () => [
    cube([-0.715, 0.8, 5.325], [0.32, 1.375, 0.1], [0.3, 0.3, 0.3]),
    cube([0.715, 0.8, 5.325], [0.32, 1.375, 0.1], [0.3, 0.3, 0.3]),

    cube([0.827, 0.8, 4.655], [0.1, 1.375, 1.3], [0.3, 0.3, 0.3]).texture("res/window.jpg"),
    cube([-0.827, 0.8, 4.655], [0.1, 1.375, 1.3], [0.3, 0.3, 0.3]).texture("res/window.jpg"),
 ];

  return [
    cube([0, 1.6, 4.25], [1.75, 0.225, 2.25], [0.15, 0.15, 0.15]),
    ...buildFrontDoor(),
    ...buildSidePanels()
  ]
};

const buildSideEntrance = () => {
  const buildRamp = () => {
    // v1-v2-v3
  // v1-v3-v4-v5
  // v1-v2-v6-v5
  // v2-v3-v4-v6
  // v5-v6-v4
    const customPrismTexelCoords = new Float32Array([ // We want a separate texture for the top face
      0, 0,  5, 0,  5, 0.5,
      4, 0.5,  4, 1,  0, 1,  0, 0.5,
      1, 0,  1, 0.5,  0, 0.5,  0, 0,
      1, 0,  1, 0.5,  0, 0.5,  0, 0,
      0, 0,  5, 0,  5, 0.5
    ]);

    return [
      cube([1.8, 0.275, 4.5], [1.1, 0.2, 1], [0.75, 0.7, 0.7]).texture("res/redbrick.jpg", 4, 0.5),
      prism([3.15, 0.275, 4.5], [-1.6, 0.2, 1], [0.7, 0.7, 0.7]).texture('res/ramp3.jpg').texelCoords(customPrismTexelCoords),
    ]
  };

  return [
    ...buildRamp()
  ]
};

const rowanHouse = () => {
  return [
    cube([0, 0, 0], [15, 0.35, 15], [0.5, 0.5, 0.5]).id("root").children([
      ...buildMainLayers(),
      ...buildFrontEntrance(),
      ...buildSideEntrance()
    ])
  ];
}

const createScene = () => {
  const [scene, idObjects] = buildScene(document.getElementById('webpageCanvas'), rowanHouse());

  scene.loadTextures(['res/redbrick.jpg', 'res/yellowsandstone.jpg', 'res/window.jpg', 'res/ramp.jpg', 'res/ramp3.jpg']);
  
  makeModelMoveable(scene, idObjects);

  return scene;
};

const scene = createScene();

const beginRendering = () => scene.draw();