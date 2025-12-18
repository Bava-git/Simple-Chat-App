package com.simplechatapp.listener;

import com.simplechatapp.model.ChatMessage;
import com.simplechatapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.logging.Logger;

@Component
public class WebSocketListener {

    @Autowired
    private UserService userService;

    @Autowired
    private SimpMessageSendingOperations messageSendingOperations;

    private static final Logger logger = Logger.getLogger(WebSocketListener.class.getName());


    @EventListener
    public void handleWebsocketConnectListener(SessionDisconnectEvent event) {
        logger.info("Connected to websocket");
    }

    public void handleWebsocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String username = headerAccessor.getSessionAttributes().get("username").toString();
        userService.setUserOnlineStatus(username, false);

        System.out.println("User disconnected from websocket");
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setType(ChatMessage.MessageType.LEAVE);
        chatMessage.setSender(username);
        messageSendingOperations.convertAndSend("/topic/public", chatMessage);
    }

}
