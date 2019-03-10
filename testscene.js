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

const createScene = () => {
  const [scene, idObjects] = buildScene(document.getElementById('webpageCanvas'),
  [
    cube([0, 0, 0], [2, 2, 2], [1, 1, 1], 'res/sky.jpg').id("root").children([
      prism([0, 1, 0], [2, 2, 2], [1, 1, 1], 'res/slate.jpg')
    ])
  ])

  scene.loadTextures(['res/sky.jpg', 'res/slate.jpg']);
  bindEvents(scene, idObjects["root"]);

  return scene;
};

const scene = createScene();

const beginRendering = () => scene.draw();