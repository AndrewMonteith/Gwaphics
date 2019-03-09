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

const initalise3dEnvironment = (scene) => {
  const cube = new Cube([0, 0, 0], [1.5, 1.5, 1.5], [1, 1, 1], "res/sky.jpg");
  const prism = new Prism([0, 1, 0], [1.5, 1.5, 1.5], [1, 1, 1], "res/slate.jpg");

  cube.add(prism); 
  scene.add(cube);

  const axis = new Axis([1, 1, 1]);

  scene.add(axis);

  bindEvents(scene, cube);
};

const createScene = () => {
  const scene = new Scene(document.getElementById('webpageCanvas'));

  scene.loadTextures(['res/sky.jpg', 'res/slate.jpg']);
  initalise3dEnvironment(scene);

  return scene;
};

const scene = createScene();

const beginRendering = () => scene.draw();