import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';

const Signup = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isloading, setisLoading] = useState(false);
    const navigate = useNavigate();


    const handleSignup = async (e) => {
        e.preventDefault();
        setisLoading(true);
        setMessage("");

        try {
            const response = await authService.signup(username, password, email);
            setisLoading(false);
            if (response.success) {
                setMessage("Account created successfully! Redirecting to login...");
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setMessage(response.message || "Signup failed. Please try again.");
            }
        } catch (error) {
            console.error("Signup failed:", error);
            setMessage("Signup failed. Please try again.");
        } finally {
            setisLoading(false);
        }

    }

    return (
        <div className="signup-container">
            <form onSubmit={handleSignup} className="signup-form">
                <h2>Create Account</h2>

                <label htmlFor="signup-email">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="email-input"
                    id="signup-email"
                    maxLength={50}
                    disabled={isloading}
                    required
                />

                <label htmlFor="signup-username">Username</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="username-input"
                    id="signup-username"
                    maxLength={20}
                    disabled={isloading}
                    required
                />

                <label htmlFor="signup-password">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="password-input"
                    id="signup-password"
                    maxLength={50}
                    disabled={isloading}
                    required
                />
                {message && <p className="status-message"
                    style={{ color: message.includes("successfully") ? "green" : "red" }}>{message}</p>}
                <div className="signup-button-container">
                    <button type="submit" disabled={!username.trim() || !email.trim() || !password.trim() || isloading}>
                        {isloading ? "Creating Account..." : "Sign Up"}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Signup;
