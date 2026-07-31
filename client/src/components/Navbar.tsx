import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/AppContext";
import {
    Search,
    BarChart3,
    History,
    LogOut,
    Menu,
    X,
    Target,
    Sun,
    Moon,
    ChartNoAxesColumnIcon,
    Swords,
    Settings,
    Crown,
    User as UserIcon,
    HelpCircle,
    Command,
    Sparkles,
    ArrowRight
} from "lucide-react";

export default function Navbar() {
    const { user, logout } = useApp();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Scroll listener for glassmorphism backdrop
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 15) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Outside click listener for user dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Global keyboard shortcut for Ctrl+K / Cmd+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setSearchModalOpen((prev) => !prev);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        navigate("/login");
    };

    const isActive = (path: string) => location.pathname === path;

    const navLinks = [
        { path: "/dashboard", label: "Dashboard", icon: <BarChart3 size={15} /> },
        { path: "/analyze", label: "Analyze", icon: <Search size={15} /> },
        { path: "/competitor-analysis", label: "Competitor Analysis", icon: <Swords size={15} /> },
        { path: "/rank-tracker", label: "Rank Tracker", icon: <Target size={15} /> },
        { path: "/history", label: "History", icon: <History size={15} /> },
    ];

    const searchPages = [
        { name: "Dashboard", path: "/dashboard", desc: "View real-time SEO metrics & scans", icon: <BarChart3 size={16} /> },
        { name: "Analyze Website", path: "/analyze", desc: "Run a full AI technical audit", icon: <Search size={16} /> },
        { name: "Competitor Analysis", path: "/competitor-analysis", desc: "Benchmark side-by-side against competitors", icon: <Swords size={16} /> },
        { name: "Rank Tracker", path: "/rank-tracker", desc: "Track Google keyword SERP positions", icon: <Target size={16} /> },
        { name: "History Logs", path: "/history", desc: "View multi-metric historical trends", icon: <History size={16} /> },
    ];

    const filteredPages = searchPages.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.desc.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <>
            {/* ==================================================
                NAVBAR MAIN CONTAINER
               ================================================== */}
            <nav
                className={`fixed top-0 w-full z-50 h-[72px] transition-all duration-300 ${
                    scrolled
                        ? "bg-[#09090B]/80 backdrop-blur-[18px] border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
                        : "bg-transparent border-b border-transparent"
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full">
                    <div className="flex items-center justify-between h-full">

                        {/* ==================================================
                            LOGO SECTION
                           ================================================== */}
                        <Link to="/" className="flex items-center gap-3 group shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[1px] shadow-[0_0_20px_rgba(59,130,246,0.5)] group-hover:scale-105 transition-transform duration-200">
                                <div className="w-full h-full rounded-[11px] bg-[#09090B] flex items-center justify-center">
                                    <ChartNoAxesColumnIcon size={22} className="text-cyan-400 group-hover:rotate-6 transition-transform duration-200" />
                                </div>
                            </div>
                            <span className="text-xl font-extrabold tracking-tight text-white font-sans">
                                Rank<span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">Pilot</span>
                            </span>
                        </Link>

                        {/* ==================================================
                            CENTER NAVIGATION (DESKTOP)
                           ================================================== */}
                        {user && (
                            <div className="hidden lg:flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.08] rounded-full p-1.5 backdrop-blur-md">
                                {navLinks.map((link) => {
                                    const active = isActive(link.path);
                                    return (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            className={`group relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-250 ${
                                                active
                                                    ? "bg-[#3B82F6] text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] font-semibold border border-blue-400/30"
                                                    : "text-slate-300 hover:text-[#3B82F6] hover:bg-[#3B82F6]/12"
                                            }`}
                                        >
                                            <span className="transition-transform duration-250 group-hover:-translate-y-[2px]">
                                                {link.icon}
                                            </span>
                                            <span>{link.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {/* ==================================================
                            RIGHT SECTION
                           ================================================== */}
                        <div className="hidden md:flex items-center gap-2.5">
                            {/* Search Shortcut Button */}
                            <button
                                onClick={() => setSearchModalOpen(true)}
                                className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-2 text-xs"
                                title="Quick Search (Ctrl+K)"
                            >
                                <Search size={14} />
                                <span className="hidden xl:inline text-[11px]">Search...</span>
                                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-slate-300 border border-white/10">⌘K</kbd>
                            </button>

                            {user ? (
                                <div className="relative" ref={dropdownRef}>
                                    {/* User Avatar + Plan Badge Button */}
                                    <button
                                        onClick={() => setDropdownOpen((prev) => !prev)}
                                        className="flex items-center gap-2.5 p-1 pr-3 rounded-full border border-white/[0.08] bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08] transition-all cursor-pointer"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-xs font-semibold text-white max-w-[90px] truncate">{user.name}</span>
                                        
                                        {/* PLAN BADGE */}
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-400/30 flex items-center gap-1 shadow-sm">
                                            <Crown size={10} className="text-yellow-300" />
                                            <span>{user.plan || "FREE"}</span>
                                        </span>
                                    </button>

                                    {/* USER DROPDOWN CARD */}
                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#09090B]/95 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)] p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                                                <p className="text-xs font-bold text-white">{user.name}</p>
                                                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                                            </div>

                                            <button
                                                onClick={() => { navigate("/dashboard"); setDropdownOpen(false); }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all text-left"
                                            >
                                                <BarChart3 size={15} className="text-blue-400" />
                                                <span>Dashboard</span>
                                            </button>

                                            <button
                                                onClick={() => { navigate("/analyze"); setDropdownOpen(false); }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all text-left"
                                            >
                                                <Search size={15} className="text-cyan-400" />
                                                <span>Run Audit</span>
                                            </button>

                                            <button
                                                onClick={() => { navigate("/rank-tracker"); setDropdownOpen(false); }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all text-left"
                                            >
                                                <Target size={15} className="text-indigo-400" />
                                                <span>Rank Tracker</span>
                                            </button>

                                            <button
                                                onClick={() => setDropdownOpen(false)}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all text-left"
                                            >
                                                <Settings size={15} className="text-slate-400" />
                                                <span>Settings</span>
                                            </button>

                                            <button
                                                onClick={() => setDropdownOpen(false)}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all text-left"
                                            >
                                                <HelpCircle size={15} className="text-amber-400" />
                                                <span>Support</span>
                                            </button>

                                            <div className="pt-1 border-t border-white/10 mt-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all text-left"
                                                >
                                                    <LogOut size={15} />
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-5 py-2 rounded-full bg-[#3B82F6] hover:bg-blue-600 text-white font-semibold text-xs transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Hamburger Toggle */}
                        <div className="flex items-center gap-2 lg:hidden">
                            <button
                                onClick={() => setSearchModalOpen(true)}
                                className="p-2 text-slate-300 hover:text-white"
                                title="Search"
                            >
                                <Search size={20} />
                            </button>
                            <button
                                onClick={() => setMobileOpen((prev) => !prev)}
                                className="p-2 text-slate-300 hover:text-white"
                            >
                                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>

                    </div>
                </div>

                {/* ==================================================
                    MOBILE SLIDE-OUT DRAWER
                   ================================================== */}
                {mobileOpen && (
                    <div className="lg:hidden bg-[#09090B]/95 backdrop-blur-2xl border-b border-white/10 px-4 py-5 space-y-3 animate-in slide-in-from-top duration-300">
                        {user && (
                            <div className="flex items-center gap-3 p-3 bg-white/[0.04] border border-white/10 rounded-2xl mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{user.name}</p>
                                    <p className="text-xs text-slate-400">{user.email}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                        isActive(link.path)
                                            ? "bg-[#3B82F6] text-white font-semibold shadow-sm"
                                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                                    }`}
                                >
                                    {link.icon}
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </div>

                        {user ? (
                            <button
                                onClick={() => { handleLogout(); setMobileOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all mt-2"
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        ) : (
                            <div className="pt-2 space-y-2">
                                <Link
                                    to="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="block px-4 py-3 text-center rounded-xl bg-white/5 text-sm font-semibold text-white"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMobileOpen(false)}
                                    className="block px-4 py-3 text-center rounded-xl bg-[#3B82F6] text-sm font-bold text-white shadow-sm"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </nav>

            {/* ==================================================
                SEARCH SHORTCUT MODAL (Ctrl+K)
               ================================================== */}
            {searchModalOpen && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-start justify-center pt-20 p-4 animate-in fade-in duration-200">
                    <div className="bg-[#09090B] border border-white/15 rounded-2xl p-4 w-full max-w-xl shadow-2xl space-y-4">
                        <div className="flex items-center gap-3 px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl">
                            <Search size={18} className="text-slate-400 shrink-0" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search pages or run audit..."
                                className="w-full bg-transparent text-white placeholder-slate-400 outline-none text-sm"
                                autoFocus
                            />
                            <button onClick={() => setSearchModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-1 max-h-72 overflow-y-auto">
                            {filteredPages.map((page) => (
                                <button
                                    key={page.path}
                                    onClick={() => {
                                        navigate(page.path);
                                        setSearchModalOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.06] text-left transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                                            {page.icon}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{page.name}</p>
                                            <p className="text-[11px] text-slate-400">{page.desc}</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={14} className="text-slate-500 group-hover:text-white transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
