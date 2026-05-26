export const replayContext = {
  active: false,
  start() { this.active = true; },
  stop() { this.active = false; }
};
