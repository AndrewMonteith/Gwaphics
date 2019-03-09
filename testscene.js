const bindEvents = (scene, cube) => {
  const onKeyDown = keyEvent => {
    switch (keyEvent.keyCode) {
      case 40: {
        cube.rotate(2, 0, 0);
        break;
      };
      case 38: {
        cube.rotate(-2, 0, 0)
        break;
      };
      case 39: {
        cube.rotate(0, 2, 0);
        break;
      };
      case 37: {
        cube.rotate(0, -2, 0);
        break;
      };
    }

    scene.draw();
  };

  document.addEventListener("keydown", onKeyDown);
};

const initalise3dEnvironment = (scene) => {
  const cube = new Cube([0, 0, 0], [1.5, 1.5, 1.5], [1, 1, 1], "res/sky.jpg");
  const cube2 = new Cube([0, 1.25, 0], [1, 1, 1], [1, 0, 0]);

  cube.add(cube2);

  const axis = new Axis([1, 1, 1]);

  // cube.texture("res/sky.jpg");

  scene.add(cube);
  scene.add(axis);

  bindEvents(scene, cube);
};

const createScene = () => {
  const scene = new Scene(document.getElementById('webpageCanvas'));

  scene.loadTextures("res/sky.jpg");
  initalise3dEnvironment(scene);

  return scene;
};

const scene = createScene();

const beginRendering = () => scene.draw();