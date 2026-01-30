import React from "react";
import './Navbar.css';
import { NavLink } from "react-router-dom";

function NavBar() { 
    return (
        <nav className="navbar">
            <ul className="nav-links">
                <li><NavLink to="/">Home</NavLink></li>
                <li><NavLink to="/movies">Movies</NavLink></li>
                <li><NavLink to="/events">Events</NavLink></li>
                <li><NavLink to="/plays">Plays</NavLink></li>
                <li><NavLink to="/sports">Sports</NavLink></li>
            </ul>
        </nav>
    );
}
export default NavBar;