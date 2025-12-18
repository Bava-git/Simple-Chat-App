import { Link, Outlet, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';
import { Suspense } from 'react';

const NavBar = () => {

    const navigate = useNavigate();
    const isAuthenticated = authService.isAuthenticated();
    const currentUser = authService.getCurrentUser();


    const handleLogout = async () => {
        try {
            await authService.logout(currentUser.username);
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            sessionStorage.clear(); // Clear session storage on logout failure
            navigate("/login");
        }
    };

    return (<>
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="navbar-brand">ChatApp</Link>
                <ul className="nav-links">
                    <li><Link to="/" className="nav-link">Home</Link></li>
                    {isAuthenticated ? (
                        <>
                            <li><Link to="/chatarea" className="nav-link">Chat Area</Link></li>
                            <span className='user-info'>Welcome, {currentUser.username}!</span>
                            <button className='logout-button' onClick={() => { handleLogout() }}>Logout</button>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login" className="nav-link">Login</Link></li>
                            <li><Link to="/signup" className="nav-link">Sign up</Link></li>
                            <li><Link to="/testscreen" className="nav-link">Test</Link></li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
        <Suspense fallback={<div>Loading...</div>}>
            <Outlet />
        </Suspense>
    </>
    )
}

export default NavBar;