import { useNavigate } from "react-router-dom";

const MainPage = () => {
    const navigate = useNavigate();

    return (
        <div className="mainpage-container">
            <div className="mainpage-header">
                <h1>Welcome to the Chat App</h1>
            </div>
            <div className="mainpage-buttons">
                <button className="mainpage-signup" onClick={() => navigate("/signup")}>Start Chatting</button>
                <button className="mainpage-login" onClick={() => navigate("/login")}>Login</button>
                <button className="mainpage-login" onClick={() => navigate("/testscreen")}>Test</button>
            </div>
        </div>
    )
}

export default MainPage;