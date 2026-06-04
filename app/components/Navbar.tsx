import { Link, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const Navbar = () => {
    const { auth } = usePuterStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        const ok = await auth.signOut();
        if (ok) navigate('/auth');
    };

    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-xl font-semibold text-[#171717] tracking-tight">ResuMatch</p>
            </Link>
            <div className="flex flex-row items-center gap-3">
                <Link to="/upload" className="primary-button w-fit text-sm">
                    Upload Resume
                </Link>
                <button
                    onClick={handleLogout}
                    className="flex flex-row items-center gap-2 border border-[#dfdfdf] hover:border-[#171717] hover:text-[#171717] rounded-[6px] p-2.5 shadow-sm transition-colors duration-200 cursor-pointer bg-white text-sm font-semibold text-[#707070]"
                >
                    Log Out
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
