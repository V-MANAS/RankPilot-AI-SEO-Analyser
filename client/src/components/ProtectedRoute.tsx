import { Outlet } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function ProtectedRoute() {

    const {token,loading} = useApp();
    if(loading) {
        return (<div>
            <div className="min-h-screen flex items-center justify-center bg-dark-900" >
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                
            </div>
        </div>);
    }
    if(!token) {
        return <div>You are not authorized to view this page. Please login.</div>;
    }
    return <Outlet />;
}
