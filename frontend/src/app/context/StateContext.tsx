import { createContext } from "react";

export const StateContext = createContext<{
    userState: { name: string | null; loggedIn: boolean };
    setUserState: React.Dispatch<React.SetStateAction<{ name: string | null; loggedIn: boolean }>>;
    smallScreen: boolean;
    setSmallScreen: React.Dispatch<React.SetStateAction<boolean>>;
}>({
    userState: { name: null, loggedIn: false },
    setUserState: () => {},
    smallScreen: false,
    setSmallScreen: () => {},
});
