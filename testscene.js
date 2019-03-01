const bindEvents = (scene, cube) => {
  const onKeyDown = keyEvent => {
    switch(keyEvent.keyCode) {
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

const createScene = () => {
  const scene = new Scene(document.getElementById('webpageCanvas'));
  
  const cube = new Cube([0, 0, 0], [1.5, 1.5, 1.5], [1, 0, 0]);
  const axis = new Axis([1, 1, 1]);
  
  scene.addNode(cube);
  scene.addNode(axis);

  bindEvents(scene, cube);

  return scene;
};

const scene = createScene();

const beginRendering = () => scene.draw();