import { Stomp } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SockJs from "sockjs-client";
import { authService } from "../services/authService";
import PrivateChat from './PrivateChat';
import * as localStore from "../services/localStorage";;

const ChatArea = () => {

    const navigate = useNavigate();
    const currentUser = authService.getCurrentUser();

    useEffect(() => {
        if (!currentUser) {
            navigate("/login");
            return
        }
    }, [currentUser, navigate]);

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [toggleWelcomeScreen, setToggleWelcomeScreen] = useState(true);
    const [isTyping, setIsTyping] = useState("");
    const [privateChats, setPrivateChats] = useState(new Map());
    const [unreadMessages, setUnreadMessages] = useState(new Map());
    const [onlineUsers, setOnlineUsers] = useState(new Set());

    const privateMessageHandler = useRef(new Map());
    const stompClient = useRef(null);
    const messageEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const emojis = localStore.emojis;


    if (!currentUser) {
        return null; // or a loading spinner
    }

    const { username, color: userColor } = currentUser;

    const scrollToBottom = () => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    const registerPrivateMessageHandler = useCallback((otherUser, handler) => {
        privateMessageHandler.current.set(otherUser, handler);
    }, []);

    const unregisterPrivateMessageHandler = useCallback((otherUser) => {
        privateMessageHandler.current.delete(otherUser);
    }, []);

    useEffect(() => {
        scrollToBottom();
        let reConnectInterval;

        const connectAndFetch = async () => {
            if (!username) {
                return
            }

            setOnlineUsers((prevUsers) => {
                const onlineUsers = new Set(prevUsers);
                onlineUsers.add(username);
                return onlineUsers;
            });

            const socket = new SockJs("http://localhost:3000/ws");
            stompClient.current = Stomp.over(socket);
            stompClient.current.connect({
                'client-id': username,
                'session-id': Date.now().toString(),
                'username': username,
            }, (frame) => {
                clearInterval(reConnectInterval);

                const GroupChat = stompClient.current.subscribe('/topic/group', (msg) => {
                    const chatMessage = JSON.parse(msg.body);

                    setOnlineUsers((prevUsers) => {
                        const newUsers = new Set(prevUsers);
                        if (chatMessage.type === 'JOIN') {
                            newUsers.add(chatMessage.sender);
                        } else if (chatMessage.type === 'LEAVE') {
                            newUsers.delete(chatMessage.sender);
                        }
                        return newUsers;
                    });

                    if (chatMessage.type === 'TYPING') {
                        setIsTyping(chatMessage.sender);
                        clearTimeout(typingTimeoutRef.current);
                        typingTimeoutRef.current = setTimeout(() => {
                            setIsTyping("");
                        }, 2000);
                    }

                    setMessages((prevMessages) => [...prevMessages, {
                        ...chatMessage,
                        timestamp: chatMessage.timestamp || new Date().toISOString(),
                        id: chatMessage.id || (Date.now() + Math.random())
                    }]);
                });

                const PrivateChat = stompClient.current.subscribe(`/user/${username}/private`, (msg) => {
                    const privateMessage = JSON.parse(msg.body);
                    const otherUser = privateMessage.sender === username ? privateMessage.repient : privateMessage.sender;

                    const handler = privateMessageHandler.current.get(otherUser);
                    if (handler) {
                        try {
                            handler(privateMessage);
                        } catch (error) {
                            console.error('Error in private message handler:', error);
                        }
                    } else if (privateMessage.repient === username) {
                        setUnreadMessages((prevUnread) => {
                            const newUnread = new Map(prevUnread);
                            const currentCount = newUnread.get(otherUser) || 0;
                            newUnread.set(otherUser, currentCount + 1);
                            return newUnread;
                        });
                    }
                });

                stompClient.current.send("/app/chat.addUser", {}, JSON.stringify({
                    username: username,
                    type: 'JOIN',
                    color: userColor,
                }));

                authService.getOnlineUsers()
                    .then(users => {

                        if (!users || typeof users !== "object") {
                            console.warn("Fetched users is not a valid object:", users);
                            return;
                        }

                        const fetchedOnlineUsers = Object.keys(users);
                        setOnlineUsers((prevUsers) => {
                            const mergeSet = new Set(prevUsers);
                            fetchedOnlineUsers.forEach(user => mergeSet.add(user));
                            mergeSet.add(username);
                            return mergeSet;
                        });
                    }).catch(error => {
                        console.error("Error fetching online users ", error);
                    });
            }, (error) => {
                console.error("STOMP connection error ", error);
                if (!reConnectInterval) {
                    reConnectInterval = setInterval(() => {
                        connectAndFetch();
                    }, 5000);
                };
            })
        }

        connectAndFetch();
        return () => {
            if (stompClient.current && stompClient.current.connected) {
                stompClient.current.disconnect();
            }
            clearTimeout(typingTimeoutRef.current);
            clearInterval(reConnectInterval);
        };


    }, [username, userColor, registerPrivateMessageHandler, unregisterPrivateMessageHandler]);


    const openPrivateChat = (otherUser) => {
        if (otherUser === username) return;

        setPrivateChats((prevMessages) => {
            const newChats = new Map(prevMessages);
            newChats.set(otherUser, true);
            return newChats;
        });

        setToggleWelcomeScreen(false);

        setUnreadMessages((unreadMessages) => {
            const newUnread = new Map(unreadMessages);
            newUnread.delete(otherUser);
            return newUnread;
        });
    };

    const closePrivateChat = (otherUser) => {
        setPrivateChats((prevMessages) => {
            const newChats = new Map(prevMessages);
            newChats.delete(otherUser);
            return newChats;
        });
        setToggleWelcomeScreen(true);
        unregisterPrivateMessageHandler(otherUser);
    };

    const sendMessage = (e) => {
        e.preventDefault();
        console.log("Passed 1");

        if (message.trim() && stompClient.current && stompClient.current.connected) {
            console.log("Passed 2");
            const chatMessage = {
                sender: username,
                content: message,
                type: 'CHAT',
                color: userColor
            }
            stompClient.current.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
            console.log("Passed 3");
            setMessage("");
            setShowEmojiPicker(false);
            console.log("Passed 4");
        }
        console.log("Passed 5");
    };

    const handleTyping = (e) => {
        setMessage(e.target.value);

        if (stompClient.current && stompClient.current.connected && e.target.value.trim()) {
            stompClient.current.send("/app/chat.sendMessage", {}, JSON.stringify({
                sender: username,
                type: 'TYPING'
            }))
        }
    };

    const addEmojiToMessage = (emoji) => {
        setMessage(prevMessage => prevMessage + emoji);
        setShowEmojiPicker(false);
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            timeZone: 'Asia/Kolkata',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (<>
        <div className="chat-container">
            <div className="sidebar">
                <div className="sidebar-header">
                    <h3>Users</h3>
                </div>
                <div className="users-list">
                    {Array.from(onlineUsers).map((user) =>
                    (
                        <div
                            key={user}
                            className={`user-item ${user === username ? currentUser : ''}`}
                            onClick={() => openPrivateChat(user)}
                        >
                            <div
                                className="user-avatar"
                                style={{ backgroundColor: user === username ? userColor : "#007bff" }}
                            >
                                {user.charAt(0).toUpperCase()}
                            </div>
                            <span className="user-name">{user}</span>
                            {user === username && <span className="user-name">(You)</span>}
                            {unreadMessages.has(user) && (
                                <span className="unread-count">{unreadMessages.get(user)}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* <div className="main-chat">
                <div className="chat-header">
                    <h4>Welcome, {username}</h4>
                </div>
                <div className="messages-container">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`message ${msg.type.toLowerCase()}`}>
                            {msg.type === 'JOIN' && <div className="system-message">{msg.sender} join the group</div>}
                            {msg.type === 'LEAVE' && <div className="system-message">{msg.sender} left the group</div>}
                            {msg.type === 'CHAT' && <div className={`chat-message ${msg.sender === username ? 'own-message' : ''}`}>
                                <div className="message-info">
                                    <span className="sender" style={{ color: msg.color || "#007bff" }}>{msg.sender}</span>
                                    <span className="time">{formatTime(msg.timestamp)}</span>
                                </div>
                                <div className="message-text">{msg.content}</div>
                            </div>}
                        </div>
                    ))}

                    {isTyping && isTyping !== username && (
                        <div className="typing-indicator">
                            <span>{isTyping} is typing...</span>
                        </div>
                    )}

                    <div ref={messageEndRef} />
                </div>

                <div className="input-area">
                    {showEmojiPicker && (
                        <div className="emoji-picker">
                            {emojis.map((emoji) => (
                                <button key={emoji} onClick={() => addEmojiToMessage(emoji)}>{emoji}</button>
                            ))}
                        </div>
                    )}
                    <form onSubmit={sendMessage} className="message-form">
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="emoji-btn"
                        >
                            😀
                        </button>
                        <input type="text" placeholder="Type a message..."
                            value={message} onChange={handleTyping} className="message-input" maxLength={500} />
                        <button type="submit" className="send-btn" disabled={!message.trim()}>
                            Send
                        </button>
                    </form>
                </div>
            </div> */}

            {toggleWelcomeScreen && <div className="main-chat">
                <h3 className="welcome-message">Welcome! {username}</h3>
                <div className="welcome-content">
                    <p className="welcome-description">Click on a user to start a private chat.
                        You can also send group messages in the chat area.
                        Use the emoji picker to add emojis to your messages.</p>
                    <p className="welcome-message">Happy chatting!</p>
                </div>
            </div>}

            {Array.from(privateChats.keys()).map((otherUser) => {
                return (
                    <PrivateChat
                        key={otherUser}
                        currentUser={username}
                        recipientUser={otherUser}
                        userColor={userColor}
                        stompClient={stompClient}
                        onClose={() => closePrivateChat(otherUser)}
                        registerPrivateMessageHandler={registerPrivateMessageHandler}
                        unregisterPrivateMessageHandler={unregisterPrivateMessageHandler}
                    />
                );
            })}
        </div >
    </>
    );
};

export default ChatArea;