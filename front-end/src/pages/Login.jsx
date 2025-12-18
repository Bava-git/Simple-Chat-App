import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.js';

const Login = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isloading, setisLoading] = useState(false);
    const navigate = useNavigate();


    const handleLogin = async (e) => {
        e.preventDefault();
        setisLoading(true);
        setMessage("");

        try {
            const response = await authService.login(username, password);
            setisLoading(false);
            if (response.success) {
                setMessage("Login successfully...!");
                setTimeout(() => {
                    navigate('/chatarea');
                }, 2000);
            } else {
                setMessage(response.message || "Login failed. Please try again.");
            }
        } catch (error) {
            console.error("Login failed:", error);
            setMessage("Login failed. Please try again.");
        } finally {
            setisLoading(false);
        }

    }

    return (
        <div className="signup-container">
            <form onSubmit={handleLogin} className="signup-form">
                <h2>Log in</h2>

                <label htmlFor="login-username">Username</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="username-input"
                    id="login-username"
                    maxLength={20}
                    disabled={isloading}
                    required
                />

                <label htmlFor="login-password">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="password-input"
                    id="login-password"
                    maxLength={50}
                    disabled={isloading}
                    required
                />
                {message && <p className="status-message"
                    style={{ color: message.includes("successfully") ? "green" : "red" }}>{message}</p>}
                <div className="signup-button-container">
                    <button type="submit" disabled={!username.trim() || !password.trim() || isloading}>
                        {isloading ? "Logging in..." : "Login"}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Login;
