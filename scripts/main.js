function $(...args) {
  if (args.length === 1) return document.getElementById(args[0]);
  return args.map((arg) => document.getElementById(arg));
}

const [carCanvas, networkCanvas] = $("car-canvas", "network-canvas");
carCanvas.width = 200;
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.95);
const N = 20;
const cars = generateCars(N);

let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
    if (i != 0) {
      NeuralNetwork.mutate(cars[i].brain, 0.3);
    }
  }
}

// setInterval(spawnCar, randInt(1000,3000))

// function spawnCar(bestCar) {

// }

function generateTraffic(N) {
  let traffic = [];

  Array(N)
    .fill(null)
    .forEach(() => {
      let y;
      do {
        y = randInt(-400, -7500, 200);
      } while (traffic.map((car) => car.y).filter((c) => c === y).length >= 2);
      const car = new Car(
        road.getLaneCenter(randInt(0, road.laneCount, 1)),
        y,
        30,
        50,
        ControlType.DUMMY,
        2
      );
      traffic.push(car);
    });
  return traffic;
}

const traffic = generateTraffic(30);

// const traffic = [
//   new Car(road.getLaneCenter(1), -100, 30, 50, ControlType.DUMMY, 2),
//   new Car(road.getLaneCenter(0), -300, 30, 50, ControlType.DUMMY, 2),
//   new Car(road.getLaneCenter(2), -300, 30, 50, ControlType.DUMMY, 2),
//   new Car(road.getLaneCenter(0), -500, 30, 50, ControlType.DUMMY, 2),
//   new Car(road.getLaneCenter(1), -500, 30, 50, ControlType.DUMMY, 2),
//   new Car(road.getLaneCenter(1), -700, 30, 50, ControlType.DUMMY, 2),
//   new Car(road.getLaneCenter(2), -700, 30, 50, ControlType.DUMMY, 2),
//   new Car(road.getLaneCenter(1), -900, 30, 50, ControlType.DUMMY, 2),
//   new Car(road.getLaneCenter(2), -900, 30, 50, ControlType.DUMMY, 2),
//   new Car(road.getLaneCenter(0), -1100, 30, 50, ControlType.DUMMY, 2),
//   new Car(road.getLaneCenter(1), -1300, 30, 50, ControlType.DUMMY, 2),
// ];

animate();

function save() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function deleteCar() {
  const index = cars.indexOf(bestCar);
  cars.splice(index, 1);
  console.log(cars.length);
  return index;
}

function discard() {
  localStorage.removeItem("bestBrain");
}

function generateCars(N) {
  const cars = [];
  for (let i = 1; i <= N; i++) {
    cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, ControlType.AI));
  }
  return cars;
}

function animate(time) {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
  }

  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic);
  }
  bestCar = cars.find((c) => c.y == Math.min(...cars.map((c) => c.y)));
  carCanvas.height = window.innerHeight; // Clean up
  networkCanvas.height = window.innerHeight; // Clean up
  carCtx.save();
  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7); // Camera
  road.draw(carCtx);
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCtx, "red");
  }

  traffic.forEach((car, i) => {
    if (car.y > bestCar.y + 300) {
      traffic.splice(i, 1);
      console.log({ traffic: traffic.length });
    }
  });

  cars.forEach((car, i) => {
    if (car.damaged) {
      cars.splice(i, 1);
      console.log({ cars: cars.length });
    }
  });

  carCtx.globalAlpha = 0.2;
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(carCtx, "blue");
  }
  carCtx.globalAlpha = 1;
  bestCar.draw(carCtx, "blue", true);

  carCtx.restore();

  networkCtx.lineDashOffset = -time / 50;
  Visualizer.drawNetwork(networkCtx, bestCar.brain);
  requestAnimationFrame(animate);
}
