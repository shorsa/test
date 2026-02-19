import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import React, { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from "react";

export type NetworkStatus = "online" | "poor" | "offline";

interface NetworkContextType {
  status: NetworkStatus;
  isConnected: boolean;
}

const NetworkContext = createContext<NetworkContextType>({
  status: "online",
  isConnected: true,
});

const ERROR_THRESHOLD = 2;
const ERROR_WINDOW_MS = 10000;

NetInfo.configure({
  reachabilityUrl: "https://clients3.google.com/generate_204",
  reachabilityMethod: "HEAD",
  reachabilityTest: async (response) => response.status === 204,
  reachabilityLongTimeout: 30000,
  reachabilityShortTimeout: 5000,
  reachabilityRequestTimeout: 10000,
  useNativeReachability: false,
});

const deriveStatus = (state: NetInfoState): NetworkStatus => {
  if (!state.isConnected) return "offline";
  if (state.isInternetReachable === false) return "offline";
  if (state.isInternetReachable === null) return "online";
  return "online";
};

export const NetworkProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [status, setStatus] = useState<NetworkStatus>("online");
  const isConnected = status === "online";

  const errorTimestamps = useRef<number[]>([]);
  const statusRef = useRef<NetworkStatus>("online");

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const newStatus = deriveStatus(state);
      if (newStatus !== statusRef.current) {
        statusRef.current = newStatus;
        setStatus(newStatus);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    setNetworkErrorReporter(() => {
      const now = Date.now();
      errorTimestamps.current = errorTimestamps.current.filter(
        (t) => now - t < ERROR_WINDOW_MS
      );
      errorTimestamps.current.push(now);

      if (errorTimestamps.current.length >= ERROR_THRESHOLD && statusRef.current === "online") {
        statusRef.current = "offline";
        setStatus("offline");
        NetInfo.refresh();
      }
    });

    return () => setNetworkErrorReporter(null);
  }, []);

  return (
    <NetworkContext.Provider value={{ status, isConnected }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
};

let networkErrorReporter: (() => void) | null = null;

const setNetworkErrorReporter = (fn: (() => void) | null) => {
  networkErrorReporter = fn;
};

export const reportNetworkErrorGlobal = () => {
  networkErrorReporter?.();
};
