/*
  Construction of Mountjoy House as seen here:
  https://www.google.com/maps/@54.7645956,-1.5723251,2a,75y,194.28h,83.81t/data=!3m6!1e1!3m4!1sQ33hJoKTtihha2HTjPOxJQ!2e0!7i13312!8i6656
*/

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
  D: 68,

  J: 74,
  K: 75,

  L: 76,
}

const _getRotatedObjectVectors = (angleX, angleY) => { 
  const cx = Math.cos(rad(angleX)), cy = Math.cos(rad(angleY));
  const sx = Math.sin(rad(angleX)), sy = Math.sin(rad(angleY));

  // We return [x-vector, y-vector, z-vector]
  return [ 
    [cx, sx*sy, -cy*sx], [0, cy, sy], [-sx, sy*cx, -cx*cy]
  ]
}

const makeCameraMoveable = (scene) => {
  let angleX = 0, angleY = 0;
  let cameraPosition = scene.getCameraPos(); 

  let cameraObjSpaceUnitVectors = _getRotatedObjectVectors(angleX, angleY);

  const invert = v => v.map(u => u * -1);

  const angleChanges = {
    [keyCodes.UpArrow]: [0, 8],
    [keyCodes.DownArrow]: [0, -8],
    [keyCodes.LeftArrow]: [8, 0],
    [keyCodes.RightArrow]: [-8, 0]
  };

  const changeAngle = (dx, dy) => {
    angleX += dx;
    angleY += dy;

    cameraObjSpaceUnitVectors = _getRotatedObjectVectors(angleX, angleY);
  }
  

  const onKeyDown = (keyEvent) => {
    switch(keyEvent.keyCode) {
      case keyCodes.UpArrow:
      case keyCodes.DownArrow:
      case keyCodes.LeftArrow:
      case keyCodes.RightArrow:
        changeAngle(...angleChanges[keyEvent.keyCode]);
        break;
      case keyCodes.W:
        cameraPosition = addVector(cameraPosition, ...cameraObjSpaceUnitVectors[2]);
        break;
      case keyCodes.S:
        cameraPosition = addVector(cameraPosition, ...invert(cameraObjSpaceUnitVectors[2]));
        break;
      case keyCodes.A:
        cameraPosition = addVector(cameraPosition, ...invert(cameraObjSpaceUnitVectors[0]));
        break;
      case keyCodes.D:
        cameraPosition = addVector(cameraPosition, ...(cameraObjSpaceUnitVectors[0]));
        break;
      case keyCodes.Q:
        cameraPosition = addVector(cameraPosition, ...cameraObjSpaceUnitVectors[1]);
        break;
      case keyCodes.E:
        cameraPosition = addVector(cameraPosition, ...invert(cameraObjSpaceUnitVectors[1]));
        break;
      default:
        return;
    }

    scene.setCameraPos(cameraPosition);
    
    scene.setLookAt(addVector(cameraPosition, ...cameraObjSpaceUnitVectors[2]));
    scene.draw();
  }

  document.addEventListener('keydown', onKeyDown);
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
const buildMainLayers = () => [ // Group by same textures.
    cube([0, 0.375, 0], [8, 0.35, 8], [1, 0.8, 0.6]).texture('res/redbrick.jpg', 8, 0.4),
    cube([0, 2.145, 0], [8, 0.40, 8], [1, 0.8, 0.6]).texture('res/redbrick.jpg', 8, 0.4),

    cube([0, 1.1, 0], [8, 1.1, 8], [1, 0.7, 0.7]).texture('res/yellowsandstone.jpg', 5, 1.2),
    cube([0, 1.725, 0], [8, 0.15, 8], [0.6, 0.5, 0.5]).texture('res/yellowsandstone.jpg', 4, 0.2),
    cube([0, 1.875, 0], [8, 0.15, 8], [1, 0.7, 0.7]).texture('res/yellowsandstone.jpg', 3.8, 0.2),
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
      cube([-.545, 0.8, 5.325], [0,0,0], [0, 0, 0]).children([
        cube([0.2725, 0, 0], [0.545, 1.375, 0.1], [0.4, 0.4, 0.4]).id("leftFrontDoor").texture("res/window.jpg").children([
          cube([0.175, 0, 0.1], [0.03, 0.25, 0.1], [1, 1, 1]),
          cube([0.14, 0, 0.135], [0.1, 0.25, 0.03], [1, 1, 1])
        ])
      ]),
      cube([.545, 0.8, 5.325], [0, 0, 0], [0, 0, 0]).children([
        cube([-0.275, 0, 0], [0.545, 1.375, 0.1], [0.4, 0.4, 0.4]).id("rightFrontDoor").texture("res/window.jpg").children([
          cube([-0.175, 0, 0.1], [0.03, 0.25, 0.1], [1, 1, 1]),
          cube([-0.14, 0, 0.135], [0.1, 0.25, 0.03], [1, 1, 1])
        ])
      ])
    ]
  }

  const buildSidePanels = () => [
    cube([-0.715, 0.8, 5.325], [0.32, 1.375, 0.1], [0.3, 0.3, 0.3]),
    cube([0.715, 0.8, 5.325], [0.32, 1.375, 0.1], [0.3, 0.3, 0.3]),

    cube([0.827, 0.8, 4.655], [0.1, 1.375, 1.3], [0.3, 0.3, 0.3]).texture("res/window.jpg"),
    cube([-0.827, 0.8, 4.655], [0.1, 1.375, 1.3], [0.3, 0.3, 0.3]).texture("res/window.jpg"),
];

  return [
    cube([0, 1.6, 4.25], [1.75, 0.225, 2.25], [0.25, 0.25, 0.25]).texture('res/blackplastic.jpg'),
    ...buildFrontDoor(),
    ...buildSidePanels()
  ]
};

const buildSideEntrance = () => {
  const buildRamp = () => {
    const customPrismTexelCoords = new Float32Array([ // We want a separate texture for the top face
      0, 0,  5, 0,  5, 0.5,
      4, 0.5,  4, 1,  0, 1,  0, 0.5,
      1, 0,  1, 0.5,  0, 0.5,  0, 0,
      1, 0,  1, 0.5,  0, 0.5,  0, 0,
      0, 0,  5, 0,  5, 0.5
    ]);

    return [
      cube([2, 0.275, 4.5], [1.1, 0.2, 1], [0.75, 0.7, 0.7]).texture("res/redbrick.jpg", 4, 0.5),
      prism([3.3, 0.275, 4.5], [-1.5, 0.2, 1], [0.7, 0.7, 0.7]).texture('res/ramp.jpg').texelCoords(customPrismTexelCoords),
    ]
  };

  const buildRampDoor = () => [
    cube([1.725, 0.975, 3.98], [0, 0, 0], [0, 0, 0]).children([
      cube([0, 0, 0], [0.08, 1.2, 0.075], [0, 0, 0]),
      cube([0.6, 0, 0], [0.08, 1.2, 0.075], [0, 0, 0]),
      cube([0.3, 0.56, 0], [0.63, 0.08, 0.075], [0, 0, 0]),

      cube([0.3, -0.04, 0], [0.52, 1.12, 0.05], [0.3, 0.3, 0.3]).id("sideDoor").texture('res/blackplastic.jpg').children([
        cube([0.175, 0, 0.0405], [0.065, 0.20, 0.015], [0.7, 0.7, 0.7]).children([
          cube([0, 0, 0], [0.03, 0.03, 0.15], [0.525, 0.525, 0.525]).children([
            cube([-0.0225, 0, 0.09], [0.075, 0.03, 0.03], [0.525, 0.525, 0.525])
          ])
        ])
      ])
    ]),
    
  ];

  return [
    ...buildRamp(),
    ...buildRampDoor()
  ]
};

const placeWindows = () => {
  const placeWindow = (position) => 
    cube(position, [0.55, 1, 0.05], [0.3, 0.3, 0.3]).texture('res/window.jpg')

  return [
    // Front of the building
    placeWindow([-1.7, 1.1, 4]),
    placeWindow([-2.4, 1.1, 4]),
    placeWindow([-3.6, 1.1, 4]),
    placeWindow([2.7, 1.1, 4]),
    placeWindow([3.5, 1.1, 4])
  ]
};

const buildSideColumns = () => {
  const placeSideColumn = (position, doUpwardSpike) => {
    const children = [
      prism([0, 0.05, 0], [0.05, 0.05, 1.55], [1, 0.8, 0.6]).texture('res/redbrick.jpg', 2, .15).rotate(90, 90, 0),
      prism([0, -0.05, 0], [0.05, -0.05, 1.55], [1, 0.8, 0.6]).texture('res/redbrick.jpg', 2, .15).rotate(90, 90, 0),

      cube([0, 0.975, 0], [0.05, 0.4, 0.05], [1, 0.7, 0.7]).texture('res/yellowsandstone.jpg').children([
        prism([0, 0.05, 0], [0.05, 0.05, 0.4], [1, 0.7, 0.7]).texture('res/yellowsandstone.jpg', 2, .15).rotate(90, 90, 0),
        prism([0, -0.05, 0], [0.05, -0.05, 0.4], [1, 0.7, 0.7]).texture('res/yellowsandstone.jpg', 2, .15).rotate(90, 90, 0),
      ]),

      cube([0, 1.325, 0], [0.125, 0.4, 0.10], [1, 0.7, 0.7]).children([
        prism([0, .275, 0], [0.10, 0.15, 0.125], [1, 0.7, 0.7]).rotate(0, 90, 0),
        cube([0, 0.1, 0.1625], [0.05, 0.125, 0.3], [0.1, 0.1, 0.1]),
        cube([0, 0.825, 0.25], [0.05, 1.325, 0.125], [0.1, 0.1, 0.1])
      ]),
    ];

    const pos1 = position, pos2 = addVector(position, 0.2, 0, 0); 
    const result = [
      cube(pos1, [0.05, 1.55, 0.05], [1, 0.8, 0.6]).texture('res/redbrick.jpg', 4, 1.75).children(children),
      cube(pos2, [0.05, 1.55, 0.05], [1, 0.8, 0.6]).texture('res/redbrick.jpg', 4, 1.75).children(children)
    ]

    return result;
  };

  return [
    ...placeSideColumn([1.125, 0.785, 4.025]),
    ...placeSideColumn([-3.1, 0.785, 4.025]),
    ...placeSideColumn([-1.305, 0.785, 4.025])
  ]
};

const buildRoadEnvironment = () => {
  const drivewayLine = (position) => 
    cube(position, [0.05, 0.025, 3], [1, 1, 1]).children([
      cube([0, 0, 1.4375], [0.25, 0.025, 0.125], [1, 1, 1])
    ]);

  return [
    cube([2.7, 0.106, 6.8], [3.4, 0.1, 3], [1, 1, 1]).texture('res/driveway.jpg', 6, 4).children([
      drivewayLine([0.56, 0.04, 0]),
      drivewayLine([-0.56, 0.04, 0]),
    ]),

    // Original: 8

    cube([1.75, 0.106, 5.75], [11.5, 0.1, 3.5], [1, 1, 1]).texture('res/driveway.jpg', 6, 4).children([
      drivewayLine([-1.18, 0.04, -0.25]),
      drivewayLine([-0.04, 0.04, -0.25]),
      drivewayLine([1.1, 0.04, -0.25]),
      drivewayLine([2.24, 0.04, -0.25]),
      drivewayLine([-2.32, 0.04, -0.25]),
      drivewayLine([-3.46, 0.04, -0.25]),
      drivewayLine([-4.6, 0.04, -0.25]),
    ]).rotate(0, 90, 0)
  ]
};

const buildTexturedGround = () => {
  return [
    cube([2.4, 0.126, 0.65], [3.2, 0.1675, 9.3], [.8, .8, .8]).texture('res/driveway.jpg', 5, 5),
    cube([5.8, 0.126, 4.65], [3.6, 0.1675, 1.3], [.8, .8, .8]).texture('res/driveway.jpg', 4, .6),
    cube([-4.2, 0.126, 5.15], [6.61, 0.1675, 4.75], [.8, .8, .8]).texture('res/driveway.jpg', 6.2, 2.2),
    cube([-1.7505, 0.126, -2.35], [11.51, 0.1675, 10.3], [.8, .8, .8]).texture('res/driveway.jpg', 8, 7),
  ]
};

const buildFireAlarm = () => {
  return [
    cube([3.6, 2.15, 4], [0,0,0], [0, 0, 0]).children([
      cube([0, 0, 0], [0, 0, 0], [0, 0, 0]).id("firealarm-rot").children([
        hexagon([0, 0, 0], [.3, .3, .2], [1, .7, 0]).id("firealarm-hexagon"),
        cube([0, 0, 0.035], [.2, .125, .05], [1, 1, 1]).id("firealarm-texture").texture('res/adt.jpg')
      ])
    ])
  ]
};

const rowanHouse = () => [
  cube([0, 0, 0], [15, 0.225, 15], [0.5, 0.5, 0.5]).id("root").children([
    ...buildMainLayers(),
    ...buildFrontEntrance(),
    ...buildSideEntrance(),
    ...buildSideColumns(),
    ...placeWindows(),
    
    ...buildTexturedGround(),
    ...buildRoadEnvironment(),
    ...buildFireAlarm()
  ])
];

let animationIsActive = false;

const doAnimationCycle = (scene, totalTime, numbeOfSteps, stepCallback) => {
  animationIsActive = true;

  let currentStep = 0, stepDirection = 1, animationTimer, finishCallback;

  const doAnimationStep = () => {
    currentStep += stepDirection;
    
    stepCallback(stepDirection, currentStep);

    if (currentStep === numbeOfSteps) {
      stepDirection = -1;
    } else if (currentStep === 0 && stepDirection === -1) {
      clearInterval(animationTimer);
      animationIsActive = false;

      if (finishCallback) {
        finishCallback();
      }
    }
    scene.draw();
  };

  animationTimer = setInterval(doAnimationStep, totalTime/numbeOfSteps);

  return {'done': doneCallback => {
    finishCallback = doneCallback;
  }}
}

const toggleFrontDoorAnimation = (scene, idObjects) => {
  const numberOfSteps = 40, rotationStep = 90/numberOfSteps;

  const frontleftPivot = idObjects["leftFrontDoor"], frontRightPivot = idObjects["rightFrontDoor"];
  const sidePivot = idObjects["sideDoor"];

  doAnimationCycle(scene, 2000, numberOfSteps, (stepDirection) => {
    frontleftPivot.rotate(0, -stepDirection * rotationStep, 0);
    frontRightPivot.rotate(0, stepDirection * rotationStep, 0);
    sidePivot.rotate(0, -stepDirection* rotationStep, 0);
  });
};

const toggleAlarmAngryAnimation = (scene, idObjects) => {
  const tweener = (t, d) => -1/2 * (Math.cos(Math.PI*t/d) - 1);
  const lerp = (a, b, r) => a + (b-a)*r;
  
  const hexagon = idObjects["firealarm-hexagon"], texture = idObjects["firealarm-texture"];
  const startColour = [1, .7, 0], endColour = [1, .3, 0];
  
  const numberOfSteps = 20, rotationStep = 90/numberOfSteps;

  const firealarmRot = idObjects["firealarm-rot"];

  doAnimationCycle(scene, 200, numberOfSteps, (_, currentStep) => {
    const rColour = tweener(currentStep, numberOfSteps);

    hexagon.children().forEach(child => {
      child.setColour(
        lerp(startColour[0], endColour[0], rColour),
        lerp(startColour[1], endColour[1], rColour),
        lerp(startColour[2], endColour[2], rColour));
    });

    const rotationDirection = (currentStep < 5 || currentStep > 14) ? 1 : -1;
    firealarmRot.rotate(0, 0, rotationStep*rotationDirection);
  });
};

const toggleLightingAnimation = (scene, idObjects) => {
  const a = 45, b = 10; // light source will move in inerval [-a, a] with max height of b.
  const numberOfSteps = 80, thetaStep = Math.PI/numberOfSteps;
  
  const getAnimationPoint = (angle) => [-a*Math.cos(angle), b*Math.sin(angle/2)];

  scene.setAmbientColour(0.025, 0.025, 0.025);

  const origLightPosition = scene.getLightPosition();
  
  doAnimationCycle(scene, 4000, numberOfSteps, (_, currentStep) => {
    const dPosition = getAnimationPoint(thetaStep*currentStep);
    
    scene.setLightPosition(
      dPosition[0],
      dPosition[1],
      origLightPosition[2]);

  }).done(() => {
    scene.setAmbientColour(0.1, 0.1, 0.1);
    scene.setLightPosition(...origLightPosition)
  });
};

const listenForAnimations = (scene, idObjects) => {
  const onKeyDown = (keyEvent) => {
    if (animationIsActive) { return; }
    
    switch(keyEvent.keyCode) {
      case keyCodes.J: {
        toggleFrontDoorAnimation(scene, idObjects);
        return;
      };
      case keyCodes.K: {
        toggleAlarmAngryAnimation(scene, idObjects);
        return;
      };
      case keyCodes.L:
        toggleLightingAnimation(scene, idObjects);
        return;
    }
  };

  document.addEventListener('keydown', onKeyDown);
};


const createScene = () => {
  const [scene, idObjects] = buildScene(document.getElementById('webpageCanvas'), rowanHouse());

  scene.loadTextures(['res/redbrick.jpg', 'res/yellowsandstone.jpg', 
                      'res/window.jpg', 'res/ramp.jpg', 'res/blackplastic.jpg',
                      'res/driveway.jpg', 'res/adt.jpg']);
  
  makeCameraMoveable(scene);
  listenForAnimations(scene, idObjects);

  return scene;
};

const scene = createScene();

const beginRendering = () => scene.draw();