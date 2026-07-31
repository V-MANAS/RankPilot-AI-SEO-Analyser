    import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
    import axios, { type AxiosInstance } from 'axios';


    interface User {
        id: string;
        name: string;
        email: string;
        plan: string;
        analysisCount?: number; 
    }


    interface AppContextType {
        user: User | null;
        token: string | null;   
        loading: boolean;
        api:AxiosInstance ;
        login:(email:string, password:string)=>Promise<{success:boolean, message:string}>;
        register:(name:string, email:string, password:string)=>Promise<{success:boolean, message:string}>;
        logout:()=>void;
    }

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    const AppContext = createContext<AppContextType | undefined>(undefined);


    export function AppProvider({ children }: { children: ReactNode}) { 

        const [user, setUser] = useState<User | null>(null);
        const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
        const [loading, setLoading] = useState(true);

        const api = axios.create({
            baseURL: BACKEND_URL,
        })

        api.interceptors.request.use((config => {
            const token = localStorage.getItem('token');

            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;

        }));


        const loadUser = async () => {
            if(!token) {
                setLoading(false);
                return;
            }
            try{
                const {data} = await api.get('/api/auth/user');
                if(data.success) {
                    setUser(data.user);
                }
            }catch(err) {
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            }
            setLoading(false);
        }

        useEffect(() => {
            loadUser().finally(() => setLoading(false));
        }, [token]);

        const login = async (email:string, password:string) : Promise<{success:boolean, message:string}> => {
            try {
                const res = await axios.post(`${BACKEND_URL}/api/auth/login`, {email, password});
                if(res.data.success) {
                    localStorage.setItem('token', res.data.token);
                    setToken(res.data.token);
                    setUser(res.data.user);
                    return {success:true, message: 'Login successful'};
                }
                return {success:false,message:res.data.message || 'Login failed'};
            }catch(error:any) {
                return {success:false, message:'Login failed'};
            }
        }

        const register = async (name:string, email:string, password:string) : Promise<{success:boolean, message:string}> => {
            try {
                const res = await axios.post(`${BACKEND_URL}/api/auth/register`, {name, email, password});  
                if(res.data.success) {
                    localStorage.setItem('token', res.data.token);
                    setToken(res.data.token);
                    setUser(res.data.user);
                    return {success:true, message: 'Registration successful'};
                }
                return {success:false,message:res.data.message || 'Registration failed'};
            }catch(error:any) {
                return {success:false, message:'Registration failed'};
            }
        }

        const logout = () => {
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
        }

        const value = {user, token, loading, api, login, register, logout};

        return <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    }


    export function useApp() {
        const context = useContext(AppContext);
        if (!context) throw new Error('useApp must be used within an AppProvider');
        return context;
    }