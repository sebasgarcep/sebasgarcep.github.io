import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Location, useLocation } from "react-router-dom";

interface NavigationState {
  pathname: string;
  search: string;
  hash: string;
}

interface NavigationContextState {
  current: NavigationState;
  previous: NavigationState | undefined;
  listeners: Set<
    (current: NavigationState, previous: NavigationState | undefined) => unknown
  >;
}

const getNavigationStateFromLocation = (
  location: Location<unknown>,
): NavigationState => ({
  pathname: location.pathname,
  search: location.search,
  hash: location.hash,
});

const isNavigationStateEqual = (
  left: NavigationState,
  right: NavigationState,
): boolean =>
  left.pathname === right.pathname &&
  left.search === right.search &&
  left.hash === right.hash;

const NavigationContext = createContext<NavigationContextState | null>(null);

export const NavigationContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const navigationRef = useRef<NavigationContextState>({
    current: getNavigationStateFromLocation(location),
    previous: undefined,
    listeners: new Set(),
  });

  useEffect(() => {
    const testState = getNavigationStateFromLocation(location);
    if (isNavigationStateEqual(testState, navigationRef.current.current)) {
      return;
    }
    const newPrevious = (navigationRef.current.previous =
      navigationRef.current.current);
    const newCurrent = (navigationRef.current.current = testState);
    for (const listener of navigationRef.current.listeners) {
      listener(newCurrent, newPrevious);
    }
  }, [location, navigationRef]);

  return (
    <NavigationContext.Provider value={navigationRef.current}>
      {children}
    </NavigationContext.Provider>
  );
};

const useNavigationContext = (): NavigationContextState => {
  const context = useContext(NavigationContext);

  if (context === null) {
    throw new Error(
      "NavigationContextProvider could not be found in the component tree.",
    );
  }

  return context;
};

export const useNavigationStateListener = (
  cb: (
    current: NavigationState,
    previous: NavigationState | undefined,
  ) => unknown,
) => {
  const context = useNavigationContext();

  useEffect(() => {
    cb(context.current, context.previous);
    context.listeners.add(cb);
    return () => {
      context.listeners.delete(cb);
    };
  }, [context, cb]);
};
