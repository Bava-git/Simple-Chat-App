import { lazy } from 'react';
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

// Import components
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import MainPage from "./pages/MainPage";
import HomePage from "./pages/HomePage";

// Lazy load pages
const Login = lazy(() => import('./pages/Login.jsx'));
const Signup = lazy(() => import('./pages/Signup.jsx'));
const ChatArea = lazy(() => import('./pages/ChatArea.jsx'));

// Import styles
import './App.css';
import './assets/styles/NavBar.css';
import './assets/styles/Signup-and-Login.css';
import './assets/styles/ChatArea.css';
import './assets/styles/PrivateChat.css';

// Test screen component
import TestScreen from "./test/TestScreen";
import './test/TestScreen.css';

function App() {

    return (
        <Router>
            <div className="App">
                <NavBar />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/chatarea" element={
                        <ProtectedRoute>
                            <ChatArea />
                        </ProtectedRoute>
                    } />
                    <Route path="*" element={<Signup />} />
                    <Route path="/testscreen" element={<TestScreen />} />
                </Routes>
            </div>
        </Router>

    )
}

export default App;