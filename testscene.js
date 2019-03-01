// const beginRendering = () => {
//   const scene = new Scene(document.getElementById('webpageCanvas'));

//   scene.addNode(new Cube(
//       position=[0, 0, 0],
//       size=[1, 1, 1],
//       rotation=[0, 0, 0],
//       colour=[1, 0, 0]));

//   scene.draw();
// };

const beginRendering = () => { 
  const scene = new Scene(document.getElementById('webpageCanvas'));

  const cube = new Cube([0, 0, 0], [1.5, 1.5, 1.5], [1, 0, 0]);
  const cube2 = new Cube([1.5, -1, 1], [2, 2, 2], [1, 1, 1]);
  const axis = new Axis([1, 1, 1]);

  scene.addNode(cube);

  scene.addNode(axis);

  scene.draw();
};