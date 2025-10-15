import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react";

type Organization = {
    id: string;
    name: string;
};

type User = {
    id: string;
    email: string;
    role: "superAdmin" | "admin" | "instructor" | "student";
    organization?: Organization;
};

type AuthContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUserState] = useState<User | null>(null);


    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUserState(JSON.parse(storedUser));
        }
    }, []);


    const setUser = (user: User | null) => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
        setUserState(user);
    };

    const value = useMemo(() => ({ user, setUser }), [user]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};

export { AuthProvider, useAuth };
