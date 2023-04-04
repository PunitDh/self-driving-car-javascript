function $(...args) {
  if (args.length === 1) return document.getElementById(args[0]);
  return args.map((arg) => document.getElementById(arg));
}

const N_CARS = 1200;
const N_TRAFFIC = 50;
const MUTATE = 0.2;
const TRAFFIC_RANDOM = true;
const SENSORS_VISIBLE = true;

const [carCanvas, networkCanvas] = $("car-canvas", "network-canvas");
carCanvas.width = 200;
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.95);

const cars = generateCars(N_CARS);

let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
    if (i != 0) {
      NeuralNetwork.mutate(cars[i].brain, MUTATE);
    }
  }
}

function generateTraffic(N) {
  let traffic = [];

  Array(N)
    .fill(null)
    .forEach(() => {
      let y;
      do {
        y = randInt(0, -6500, 200);
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

const traffic = TRAFFIC_RANDOM
  ? generateTraffic(N_TRAFFIC)
  : [
      new Car(road.getLaneCenter(1), -100, 30, 50, ControlType.DUMMY, 2),
      new Car(road.getLaneCenter(0), -300, 30, 50, ControlType.DUMMY, 2),
      new Car(road.getLaneCenter(2), -300, 30, 50, ControlType.DUMMY, 2),
      new Car(road.getLaneCenter(0), -500, 30, 50, ControlType.DUMMY, 2),
      new Car(road.getLaneCenter(1), -500, 30, 50, ControlType.DUMMY, 2),
      new Car(road.getLaneCenter(1), -700, 30, 50, ControlType.DUMMY, 2),
      new Car(road.getLaneCenter(2), -700, 30, 50, ControlType.DUMMY, 2),
      new Car(road.getLaneCenter(1), -900, 30, 50, ControlType.DUMMY, 2),
      new Car(road.getLaneCenter(2), -900, 30, 50, ControlType.DUMMY, 2),
      new Car(road.getLaneCenter(0), -1100, 30, 50, ControlType.DUMMY, 2),
      new Car(road.getLaneCenter(1), -1300, 30, 50, ControlType.DUMMY, 2),
    ];

let reloadCounter = 30;

setInterval(() => {
  reloadCounter--;
}, 1000);

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
    cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, ControlType.AI, 4));
  }
  return cars;
}

function animate(time) {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
  }

  console.log({reloadCounter, cars: cars.length, traffic: traffic.length})

  if (reloadCounter <= 0) {
    location.reload();
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
      reloadCounter = 30;
      if (traffic.length <= 0) {
        if (N_CARS > 1) {
          save();
        }
        location.reload();
        try{
        localStorage.setItem("carsSurvived", JSON.stringify([...JSON.parse(localStorage.getItem("carsSurvived")), cars.length]))
        } catch (e) {
          console.error("error")
        }
      }
    }
  });

  cars.forEach((car, i) => {
    if (car.damaged) {
      cars.splice(i, 1);

      if (cars.length <= 0) {
        location.reload();
      }
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
