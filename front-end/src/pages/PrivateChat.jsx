import { useEffect, useRef, useState } from "react";
import { authService } from "../services/authService";
import * as localStore from "../services/localStorage";

const PrivateChat = ({
    currentUser,
    recipientUser,
    userColor,
    stompClient,
    onClose,
    registerPrivateMessageHandler,
    unregisterPrivateMessageHandler,
}) => {

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messageEndRef = useRef(null);
    const messageIdRef = useRef(new Set());
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojis = localStore.emojis;

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const createMessagesId = (msg) => {
        return `${msg.sender} - ${msg.recipient} - ${msg.content} - ${msg.timestamp}`;
    };

    useEffect(() => {
        let isMounted = true;
        const loadMessageHistory = async () => {
            try {
                const response = await authService.fetchPrivateMessage(currentUser, recipientUser);
                if (response && isMounted) {
                    const chatHistory = response;
                    const processedHistory = chatHistory.map((msg) => {
                        const messageId = msg.id || createMessagesId(msg);
                        return {
                            ...msg,
                            id: messageId
                        };
                    });
                    // console.log(processedHistory);
                    messageIdRef.current.clear();
                    processedHistory.forEach(msg => {
                        messageIdRef.current.add(msg.id);
                    });
                    setMessages(processedHistory);

                };
            } catch (error) {
                console.error("Error loading message history ", error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                };
            };
        };
        loadMessageHistory();
        registerPrivateMessageHandler(recipientUser, handleIncomingPrivateMessage);

        return () => {
            isMounted = false;
            unregisterPrivateMessageHandler(recipientUser);
        };
    }, [currentUser, recipientUser, registerPrivateMessageHandler, unregisterPrivateMessageHandler, message, messages]);

    setInterval(() => {
        
    }, 500);

    const handleIncomingPrivateMessage = (privateMessage) => {
        const messageId = privateMessage.id || createMessagesId(privateMessage);
        const isOwnMessage = privateMessage.sender === currentUser;
        const isRelevantMessage =
            (privateMessage.sender === currentUser && privateMessage.recipient === recipientUser)
            || (privateMessage.sender === recipientUser && privateMessage.recipient === currentUser);
        if (isRelevantMessage && !isOwnMessage) {
            if (!messageIdRef.current.has(message.id)) {
                const newMessage = {
                    ...privateMessage,
                    id: messageId
                };
                messageIdRef.current.add(messageId);
                setMessages(prev => [...prev, newMessage]);
            };
        };
    };

    const sendPrivateMessage = (e) => {
        e.preventDefault();

        if (message.trim() && stompClient.current && stompClient.current.connected) {
            const timestamp = new Date();
            const privateMessage = {
                sender: currentUser,
                recipient: recipientUser,
                content: message.trim(),
                type: "PRIVATE_MESSAGE",
                color: userColor,
                timestamp: timestamp
            };

            const messageId = createMessagesId(privateMessage);
            const messageWithId = {
                ...privateMessage,
                id: messageId
            }

            if (!messageIdRef.current.has(messageId)) {
                messageIdRef.current.add(messageId);
                setMessages((prevMessage) => [...prevMessage, messageWithId]);
            }

            try {
                if (stompClient.current.connected) {
                    stompClient.current.send("/app/chat.sendMessage", {}, JSON.stringify(privateMessage));
                    setMessage("");
                } else {
                    setMessages((prevMessage) => prevMessage.filter(msg => msg.id !== messageId));
                    messageIdRef.current.delete(messageId);
                }
            } catch (error) {
                console.error("Error sending message in private message ", error);
                setMessages((prevMessage) => prevMessage.filter(msg => msg.id !== messageId));
                messageIdRef.current.delete(messageId);
            }
        };
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            timeZone: 'Asia/Kolkata',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
        })
    };

    if (loading) {
        return (
            <div className="private-chat-window">
                <div className="private-chat-header">
                    <h3>{recipientUser}</h3>
                    <button onClick={onClose} className="close-btn">Close</button>
                </div>
                <div className="loading">Loading Messages...</div>
            </div>
        );
    };

    const addEmojiToMessage = (emoji) => {
        setMessage(prevMessage => prevMessage + emoji);
        setShowEmojiPicker(false);
    };

    return (
        <div className="main-chat">
            <div className="chat-header">
                <button onClick={onClose} className="close-btn">&#8592;</button>
                <div className="chat-header-userdetails">
                    <div className="user-avatar">{recipientUser.charAt(0).toUpperCase()}</div>
                    <h3>{recipientUser}</h3>
                </div>
            </div>
            <div className="private-chat-container">
                {messages.length === 0 ? (<div className="no-messages">No messages yet, Start chatting!</div>) :
                    (messages.map(msg => (
                        <div className="message-container" key={msg.id}>
                            <div
                                className={`private-message ${msg.sender === currentUser ? 'own-message' : 'received-message'}`}>
                                <div className="message-header">
                                    <span className="sender-name"
                                        style={{ color: msg.color || '#6b73FF' }}
                                    >{msg.sender === currentUser ? 'You' : msg.sender}</span>
                                    <span className="timestamp">{formatTime(msg.timeStamp)}</span>
                                </div>
                                <div className="message-body">
                                    <span className="message-content">{msg.content}</span>
                                </div>
                            </div>
                        </div>)
                    ))}
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
                <form onSubmit={sendPrivateMessage} className="message-form">
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="emoji-btn"
                    >
                        😀
                    </button>
                    <input type="text" placeholder={`Message ${recipientUser}...`} value={message}
                        onChange={(e) => setMessage(e.target.value)} className="message-input" maxLength={500} />
                    <button type="submit" className="send-btn" disabled={!message.trim()}>
                        Send
                    </button>
                </form>
            </div>
        </div >
    )

}

export default PrivateChat;