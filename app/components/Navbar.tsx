import {Link} from "react-router";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/">
        <p className="text-xl font-semibold text-[#171717] tracking-tight">ResuMatch</p>
      </Link>

      <Link to="/upload" className="primary-button w-fit text-sm">
        Upload Resume
      </Link>
    </nav>
  )
}

export default Navbar
