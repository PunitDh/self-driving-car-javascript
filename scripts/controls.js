class Controls {
  constructor(controlType) {
    this.forward = false;
    this.left = false;
    this.right = false;
    this.reverse = false;
    switch (controlType) {
      case ControlType.KEYS:
        this.#addKeyboardListeners();
        break;
      case ControlType.DUMMY:
        this.forward = true;
        break;
    }
  }

  #addKeyboardListeners() {
    document.onkeydown = (event) => {
      switch (event.key) {
        case 'r':
        case ' ':
          location.reload();
          break;
        case "ArrowLeft":
          event.preventDefault();
          this.left = true;
          break;
        case "ArrowRight":
          event.preventDefault();
          this.right = true;
          break;
        case "ArrowUp":
          event.preventDefault();
          this.forward = true;
          break;
        case "ArrowDown":
          event.preventDefault();
          this.reverse = true;
          break;
      }
    };

    document.onkeyup = (event) => {
      switch (event.key) {
        case "ArrowLeft":
          this.left = false;
          break;
        case "ArrowRight":
          this.right = false;
          break;
        case "ArrowUp":
          this.forward = false;
          break;
        case "ArrowDown":
          this.reverse = false;
          break;
      }
    };
  }
}
