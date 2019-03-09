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
  // const cube = new Cube([0, 0, 0], [1.5, 1.5, 1.5], [1, 1, 1], "res/sky.jpg");
  // const cube2 = new Cube([0, 1.25, 0], [1, 1, 1], [1, 0, 0]);
  // cube.add(cube2);
  // scene.add(cube);

  const prism = new Prism([0, 0, 0], [3, 3, 3], [1, 1, 1], "res/slate.jpg");

  scene.add(prism);

  const axis = new Axis([1, 1, 1]);

  scene.add(axis);

  bindEvents(scene, prism);
};

const createScene = () => {
  const scene = new Scene(document.getElementById('webpageCanvas'));

  scene.loadTextures("res/slate.jpg");
  initalise3dEnvironment(scene);

  return scene;
};

const scene = createScene();

const beginRendering = () => scene.draw();