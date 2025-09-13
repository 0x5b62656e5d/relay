import { createContext } from "react";

export const UserContext = createContext<{
    userState: { name: string | null; loggedIn: boolean };
    setUserState: React.Dispatch<React.SetStateAction<{ name: string | null; loggedIn: boolean }>>;
}>({
    userState: { name: null, loggedIn: false },
    setUserState: () => {},
});
