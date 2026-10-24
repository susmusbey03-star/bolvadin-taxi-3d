export class InputController {
  constructor() {
    this.state = {
      accelerate: false,
      brake: false,
      left: false,
      right: false,
      reverse: false,
      pause: false
    };

    this.keyboardMap = {
      KeyW: 'accelerate',
      ArrowUp: 'accelerate',
      KeyS: 'brake',
      ArrowDown: 'brake',
      KeyA: 'left',
      ArrowLeft: 'left',
      KeyD: 'right',
      ArrowRight: 'right',
      KeyQ: 'reverse'
    };

    this.touchButtons = {
      accelerate: document.getElementById('accelerate-button'),
      brake: document.getElementById('brake-button'),
      left: document.getElementById('left-button'),
      right: document.getElementById('right-button')
    };

    this.bindKeyboard();
    this.bindTouch();
  }

  bindKeyboard() {
    window.addEventListener('keydown', (event) => {
      const action = this.keyboardMap[event.code];
      if (!action) return;

      if (action === 'accelerate') this.state.accelerate = true;
      if (action === 'brake') this.state.brake = true;
      if (action === 'left') this.state.left = true;
      if (action === 'right') this.state.right = true;
      if (action === 'reverse') this.state.reverse = true;

      if (event.code === 'Space') {
        this.state.pause = !this.state.pause;
      }
    });

    window.addEventListener('keyup', (event) => {
      const action = this.keyboardMap[event.code];
      if (!action) return;

      if (action === 'accelerate') this.state.accelerate = false;
      if (action === 'brake') this.state.brake = false;
      if (action === 'left') this.state.left = false;
      if (action === 'right') this.state.right = false;
      if (action === 'reverse') this.state.reverse = false;
    });
  }

  bindTouch() {
    Object.entries(this.touchButtons).forEach(([action, element]) => {
      if (!element) return;

      const press = (event) => {
        event.preventDefault();
        this.state[action] = true;
        element.classList.add('active');
      };

      const release = (event) => {
        event.preventDefault();
        this.state[action] = false;
        element.classList.remove('active');
      };

      element.addEventListener('pointerdown', press);
      element.addEventListener('pointerup', release);
      element.addEventListener('pointerleave', release);
      element.addEventListener('pointercancel', release);
    });
  }

  getState() {
    return {
      accelerate: this.state.accelerate,
      brake: this.state.brake,
      left: this.state.left,
      right: this.state.right,
      reverse: this.state.reverse,
      pause: this.state.pause
    };
  }

  togglePause() {
    this.state.pause = !this.state.pause;
  }
}
