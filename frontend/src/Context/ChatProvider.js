


import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

const ChatContext = createContext(); // This line creates a new context called ChatContext using the createContext function. This context will be used to share data (state and functions) between different parts of your application.


const ChatProvider = ({children}) => {
     // This section defines a ChatProvider component. This component is responsible for wrapping other components in your application, allowing them to access the chat-related state and functions through the ChatContext.
    
  const [user, setUser] = useState();
  const [selectedChat, setSelectedChat] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState([]);
    
    const navigate = useNavigate();
    
    useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (!userInfo) navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]); // [navigate]: This is an array containing a single element, navigate. It indicates that the effect should run whenever the value of the navigate variable changes.
// In React's useEffect, when you specify a dependency array, the effect will only run when any of the variables or values listed in the dependency array change between renders.
    
    
  return <ChatContext.Provider value={
    { user, setUser, selectedChat, setSelectedChat, chats, setChats, notification, setNotification}
  }>
          {children}
    </ChatContext.Provider>
}

export const ChatState = () => { // This code defines a custom hook named useChatState. This hook allows components within your application to access the ChatContext and retrieve the chat-related state and functions that were provided by the ChatProvider
  return useContext(ChatContext);
};

export default ChatProvider;