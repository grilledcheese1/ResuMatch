import { Link } from "react-router";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { reducedMotion, navbarSlideDown } from "~/lib/animations";

const Navbar = () => {
  const navRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (reducedMotion()) return;
    navbarSlideDown(navRef.current);
  }, { scope: navRef });

  return (
    <nav ref={navRef} className="navbar">
      <Link to="/">
        <p className="text-xl font-semibold text-[#171717] tracking-tight">ResuMatch</p>
      </Link>

      <Link to="/upload" className="primary-button w-fit text-sm">
        Upload Resume
      </Link>
    </nav>
  );
};

export default Navbar;
