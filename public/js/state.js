// state.js
// Lightweight state manager with Pub/Sub pattern

class StateAdmin {
  constructor() {
    this.state = {
      user: null, // null if not logged in
      subjects: [], // List of subjects with topics
      isFetching: false, // loading indicator
    };
    this.listeners = [];
  }

  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Update state and notify listeners
  setState(newStatePart) {
    this.state = { ...this.state, ...newStatePart };
    this.notify();
  }

  // Get current state
  getState() {
    return this.state;
  }

  // Notify all subscribed listeners
  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

export const stateStore = new StateAdmin();
