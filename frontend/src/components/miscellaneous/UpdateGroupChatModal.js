import React from 'react'
import { useState } from "react";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import axios from 'axios';
import UserListItem from "../userAvatar/UserListItem";

import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
  IconButton,
  Spinner,
} from "@chakra-ui/react";

import { ChatState } from "../../Context/ChatProvider";



const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);
  const toast = useToast();
      

    
    const { selectedChat, setSelectedChat, user } = ChatState();
    
   const handleRemove = async (user1) => {
  if (selectedChat.groupAdmin?._id !== user._id && user1._id !== user._id) {
    toast({
      title: "Only admins can remove someone!",
      status: "error",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    });
    return;
  }

  try {
    setLoading(true);
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };
    const response = await axios.put(`http://localhost:5000/api/chat/groupremove`, {
      chatId: selectedChat._id,
      userId: user1._id,
    }, config);

    if (response.status === 200) {
      if (user1._id === user._id) {
        setSelectedChat(null); // Clear the selected chat if the current user is being removed.
      } else {
        setSelectedChat(response.data); // Update selected chat with the new data.
      }
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } else {
      handleRemoveError("Failed to remove user. Please try again.");
    }
  } catch (error) {
    handleRemoveError(error.response?.data?.message || "An error occurred while removing the user.");
  }
  setGroupChatName("");
};

const handleRemoveError = (errorMessage) => {
  setLoading(false);
  toast({
    title: "Error Occurred!",
    description: errorMessage,
    status: "error",
    duration: 5000,
    isClosable: true,
    position: "bottom",
  });
};

    
   const handleRename = async () => {
  if (!groupChatName) {
    return;
  }

  try {
    setRenameLoading(true);

    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    const requestData = {
      chatId: selectedChat._id,
      chatName: groupChatName,
    };

    const response = await axios.put('http://localhost:5000/api/chat/rename', requestData, config);

    if (response.status === 200) {
      // Update the chat name in your local state
      setSelectedChat({ ...selectedChat, chatName: groupChatName });
      setRenameLoading(false);
      setGroupChatName(""); // Clear the input field
      toast({
        title: "Chat Renamed",
        description: "The chat has been successfully renamed.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } else {
      handleRenameError("Failed to rename chat. Please try again.");
    }
  } catch (error) {
    handleRenameError(error.response?.data?.message || "An error occurred while renaming the chat.");
  }
};

   const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`http://localhost:5000/api/user?search=${search}`, config);
      console.log(data);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast({
        title: "User Already in group!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only admins can add someone!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(`http://localhost:5000/api/chat/groupadd`,
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
    setGroupChatName("");
  };
const handleRenameError = (errorMessage) => {
  setRenameLoading(false);
  toast({
    title: "Error Occurred!",
    description: errorMessage,
    status: "error",
    duration: 5000,
    isClosable: true,
    position: "bottom",
  });
};

   return (
    <>
       <IconButton display={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />

    <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
                   <ModalHeader
                   fontSize="35px"
                   fontFamily="Work sans"
                   display="flex"
                   justifyContent="center"
                >  {selectedChat.chatName}  </ModalHeader>
                   
          <ModalCloseButton />
        <ModalBody display="flex" flexDir="column" alignItems="center">
            <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
              {selectedChat.users.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  admin={selectedChat.groupAdmin}
                  handleFunction={() => handleRemove(u)}
                />
              ))}
            </Box>
                       
                       {/* renaming the grp  */}
            <FormControl display="flex">
              <Input
                placeholder="Chat Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameloading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>
                       
            {/* add new user to the grp  */}
            <FormControl>
              <Input
                placeholder="Add User to group"
                mb={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>

            {loading ? (
              <Spinner size="lg" />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}                       
        </ModalBody>

           <ModalFooter>
            <Button onClick={() => handleRemove(user)} colorScheme="red">
              Leave Group
            </Button>
        </ModalFooter>
                   
        </ModalContent>
      </Modal>
    </>
  )
}

export default UpdateGroupChatModal