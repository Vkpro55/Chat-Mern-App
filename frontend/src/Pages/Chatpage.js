import {ChatState} from "../Context/ChatProvider"
import { Box } from "@chakra-ui/layout";
import SideDrawer from '../components/miscellaneous/SideDrawer'
import Chatbox from "../components/Chatbox"
import MyChats from "../components/MyChats";
import { useState } from "react";

const Chatpage = () => {
  // parent state in chat box so that when we leave the chat box the functionality of my chat box also updated
  const [fetchAgain, setFetchAgain] = useState(false);
  

  // //take user state from context api and destructure the chatstate to get user state
  const { user } =ChatState();

  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <Box display="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px">
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
};

export default Chatpage;
