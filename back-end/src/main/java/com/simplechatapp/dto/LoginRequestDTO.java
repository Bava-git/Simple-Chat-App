package com.simplechatapp.dto;

import lombok.Data;

@Data
public class LoginRequestDTO {

    private String username;
    private String password;
    private boolean isOnline;

}
