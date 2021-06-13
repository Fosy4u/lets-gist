import react, { useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useHistory } from "react-router-dom";
import { ChatEngine } from "react-chat-engine";
import { auth } from "../fireBase";
import { useAuth } from "../contexts/authContext";
import axios from "axios";
const Chats = () => {
  //getting user from the authContext provider which stores users are values
  const { user } = useAuth();

  //using history to manage route
  const history = useHistory();
  //setting loading state
  const [loading, setloading] = useState(true);

  //to get files/images
  const getFiles = async (url) => {
    const result = await fetch(url);
    const data = await result.blob(); /*converting the result to binary */
    return new File([data], "userPhoto.jpg", { type: "image/jpeg" });
  };

  useEffect(() => {
    if (!user) {
      history.push("/");
      return;
    }
    axios
      .get("https://api.chatengine.io/users/", {
        headers: {
          "project-id": process.env.REACT_APP_LETS_CHAT_ENGINE_ID,
          "user-name": user.displayName,
          "user-secret": user.uid,
        },
      })
      .then(() => {
        setloading(false);
      })
      .catch(() => {
        let formdata = new FormData();
        formdata.append("email", user.email);
        formdata.append("username", user.displayName);
        formdata.append("secret", user.uid);
        getFiles(user.photoURL) //calling getfile function to get the file image of the user
          .then((profileImage) => {
            formdata.append("Avatar", profileImage, profileImage.name);

            axios
              .post("https://api.chatengine.io/users/", formdata, {
                headers: {
                  "private-key": process.env.REACT_APP_LETS_CHAT_ENGINE_KEY,
                },
              })
              .then(() => {
                setloading(false);
              })
              .catch((error) => console.log(error));
          });
      });
  }, [user, history]);

  const handleSignout = async () => {
    await auth.signOut();
    history.push("/");
  };

  if (!user) return "loading....";
  return (
    <div className="chatPage">
      <div className="navBar">
        <div className="logoTab"> Lets Chat</div>
        <div className="signoutTab" onClick={handleSignout}>
          {" "}
          {user.displayName} Sign Out
        </div>
      </div>
      <pre>{process.env.React_APP_LETS_TALK_CHAT_ENGINE_ID}</pre>
      <ChatEngine
        height="calc(100vh - 66px"
        projectID={process.env.REACT_APP_LETS_CHAT_ENGINE_ID}
        userName={user.displayName}
        userSecret={user.uid}
      />
    </div>
  );
};

export default Chats;