import { AppState, AppStateStatus } from "react-native";

type AppStateListener = (state: AppStateStatus) => void;

class AppStateManager {
  private currentState: AppStateStatus = AppState.currentState ?? "active";

  private listeners = new Set<AppStateListener>();

  constructor() {
    AppState.addEventListener("change", this.handleStateChange);
  }

  private handleStateChange = (nextState: AppStateStatus) => {
    this.currentState = nextState;
    this.listeners.forEach((listener) => listener(nextState));
  };

  getCurrentState() {
    return this.currentState;
  }

  isActive() {
    return this.currentState === "active";
  }

  subscribe(listener: AppStateListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const appStateManager = new AppStateManager();

