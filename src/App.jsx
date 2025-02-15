import { use, useEffect } from "react";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login from "./components/login/login";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";

//utub

const App = () => {

  const{currentUser, isLoading, fetchUserInfo} =  useUserStore()
  const{chatId} =  useChatStore()


  useEffect(()=>{
    const unSub = onAuthStateChanged(auth,(user)=>{
      fetchUserInfo(user?.uid)

    })

    return () => {
      unSub()
    }

  },[fetchUserInfo]);

  console.log(fetchUserInfo)

  
  if (isLoading) return <div className="Loading">Loading..</div>


  return (
    <div className='container'>
      {
        currentUser ? (
        <>
          <List/>
          {chatId && <Chat/>}
          {chatId && <Detail/>}
        </>
        ) :(
        <Login/>
      )}
      <Notification/>
    </div>
  );
};

/*const App = () => {  
  return (
    <div className='container'>
      
      <List />
      <Chat />
      <Detail />
       
      

    </div>
  );
};*/

export default App

//sebelum rubah 


/*const App = () => {  
  return (
    <div className='container'>
      
      <List />
      <Chat />
      <Detail />
       
      

    </div>
  );
};*/

//chat got
/*return (
    <div className='container'>
      {
        user ? (
        <>
          <List />
          <Chat />
          <Detail />
        </>
        ) :(
        <Login />
      )}
      <Notification/>
      

    </div>
  );
};*/