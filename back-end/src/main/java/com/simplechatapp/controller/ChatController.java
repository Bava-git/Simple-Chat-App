package com.simplechatapp.controller;

import com.simplechatapp.repository.ChatMessageRepository;
import com.simplechatapp.model.ChatMessage;
import com.simplechatapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class ChatController {

    @Autowired
    private UserService userService;
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    @Autowired
    private SimpMessagingTemplate messageTemplate;

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {

        if (userService.userExists(chatMessage.getSender())) {
            headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
            userService.setUserOnlineStatus(chatMessage.getSender(), true);

            System.out.println("USer Added Successfully " + chatMessage.getSender() +
                    " with session ID " + headerAccessor.getSessionId());

            chatMessage.setTimeStamp(LocalDateTime.now());
            if (chatMessage.getContent() == null) {
                chatMessage.setContent("");
            }
            return chatMessageRepository.save(chatMessage);
        }
        return null;
    }

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {

        if (userService.userExists(chatMessage.getSender())) {

            if (chatMessage.getTimeStamp() == null) {
                chatMessage.setTimeStamp(LocalDateTime.now());
            }

            if (chatMessage.getContent() == null) {
                chatMessage.setContent("");
            }

            return chatMessageRepository.save(chatMessage);
        }
        return null;

    }

    @MessageMapping("/chat.sendPrivateMessage")
    public void sendPrivateMessage(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {

        if (userService.userExists(chatMessage.getSender()) && userService.userExists(chatMessage.getRecipient())) {

            if (chatMessage.getTimeStamp() == null) {
                chatMessage.setTimeStamp(LocalDateTime.now());
            }

            if (chatMessage.getContent() == null) {
                chatMessage.setContent("");
            }

            chatMessage.setType(ChatMessage.MessageType.PRIVATE_MESSAGE);
            ChatMessage saveMessage = chatMessageRepository.save(chatMessage);
            System.out.println("Message saved successfully with ID" + saveMessage.getId());

            try {
                String recipientDestination = "/user/" + chatMessage.getRecipient() + "/queue/private";
                System.out.println("Sending message to recipient destination " + recipientDestination);
                messageTemplate.convertAndSend(recipientDestination, saveMessage);

                String senderDestination = "/user/" + chatMessage.getSender() + "/queue/private";
                System.out.println("Sending message to sender destination " + senderDestination);
                messageTemplate.convertAndSend(senderDestination, saveMessage);
            } catch (Exception e) {
                System.out.println("ERROR occurred while sending the message " + e.getMessage());
                e.getStackTrace();
            }


        }
    }

}
