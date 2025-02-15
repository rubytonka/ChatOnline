import { useEffect, useState, useRef } from "react";
import "./chat.css";
import CryptoJS from "crypto-js"; // Import CryptoJS untuk AES-256
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, onSnapshot, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";

const SECRET_KEY = "E4F5D2A8C7B3E9F1023467D8AC5B1F0E"; // 🔒 Hardcoded AES-256 Key

const encryptMessage = (message) => {
    return CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
};

const decryptMessage = (ciphertext) => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8) || "[Decryption Error]";
    } catch (error) {
        return "[Decryption Error]";
    }
};

const Chat = () => {
    const [chat, setChat] = useState(null);
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [img, setImg] = useState({ file: null, url: "" });

    const endRef = useRef(null);
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
    const { currentUser } = useUserStore();

    useEffect(() => {
        console.log("Chat ID:", chatId);
        console.log("User data:", user);
    }, [chatId, user]);

    useEffect(() => {
        if (endRef.current) {
            endRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chat?.messages]);

    useEffect(() => {
        if (!chatId) return;

        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            const chatData = res.data();
            if (chatData?.messages) {
                chatData.messages = chatData.messages.map((msg) => ({
                    ...msg,
                    text: decryptMessage(msg.text), // 🔓 Dekripsi pesan yang diterima
                }));
            }
            setChat(chatData);
        });

        return () => unSub();
    }, [chatId]);

    const handleEmoji = (emojiData) => {
        setText((prev) => prev + emojiData.emoji);
        setOpen(false);
    };

    const handleImg = (e) => {
        if (e.target.files[0]) {
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0]),
            });
        }
    };

    const handleSend = async () => {
        if (text.trim() === "") return;

        let imgUrl = null;
        if (img.file) {
            imgUrl = await upload(img.file);
        }

        try {
            const encryptedText = encryptMessage(text); // 🔐 Enkripsi sebelum dikirim
            const decryptedText = text; // Gunakan teks asli untuk lastMessage

            const messageData = {
                senderId: currentUser.id,
                text: encryptedText,
                createdAt: Date.now(),
            };

            if (imgUrl) {
                messageData.img = imgUrl;
            }

            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion(messageData),
            });

            const userIDs = [currentUser.id, user?.id];

            for (const id of userIDs) {
                if (!id) continue;
            
                const userChatsRef = doc(db, "userchats", id);
                const userChatsSnapshot = await getDoc(userChatsRef);
            
                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data();
                    const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);
            
                    if (chatIndex !== -1) {
                        const decryptedText = decryptMessage(encryptedText); // 🔓 Dekripsi pesan terakhir
            
                        userChatsData.chats[chatIndex].lastMessage = decryptedText; // Simpan teks terdekripsi
                        userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
                        userChatsData.chats[chatIndex].updatedAt = Date.now();
            
                        await updateDoc(userChatsRef, {
                            chats: userChatsData.chats,
                        });console.log("Updated Firebase document with:", userChatsData.chats[chatIndex].lastMessage);
                    }
                }
            }
            
        } catch (err) {
            console.error("Error sending message:", err);
        }

        setImg({ file: null, url: "" });
        setText("");
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSend();
        }
    };

    return (
        <div className="chat">
            <div className="top">
                <div className="user">
                    {user ? (
                        <>
                            <img src={user.avatar || "./avatar.png"} alt="User Avatar" />
                            <div className="texts">
                                <span>{user.username || "Unknown User"}</span>
                                <p>Last seen 1 min ago</p>
                            </div>
                        </>
                    ) : (
                        <p>Loading user...</p>
                    )}
                </div>
                <div className="icons">
                    <img src="./phone.png" alt="Phone" />
                    <img src="./video.png" alt="Video" />
                    <img src="./info.png" alt="Info" />
                </div>
            </div>

            <div className="center">
                {chat?.messages?.map((message, index) => (
                    <div
                        className={message.senderId === currentUser?.id ? "message own" : "message"}
                        key={message?.createdAt || index}
                    >
                        <div className="texts">
                            {message.img && <img src={message.img} alt="Message Attachment" />}
                            <p>{message.text}</p>
                        </div>
                    </div>
                ))}

                {img.url && (
                    <div className="message own">
                        <div className="texts">
                            <img src={img.url} alt="Selected Attachment" />
                        </div>
                    </div>
                )}
                <div ref={endRef}></div>
            </div>

            <div className="bottom">
                <div className="icons">
                    <label htmlFor="file">
                        <img src="./img.png" alt="Image" />
                    </label>
                    <input type="file" id="file" style={{ display: "none" }} onChange={handleImg} />
                    <img src="./camera.png" alt="Camera" />
                    <img src="./mic.png" alt="Microphone" />
                </div>
                <input
                    type="text"
                    placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "You Cannot Send Message" : "Type a message..."}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={handleKeyPress} // 📌 Tambahkan event handler Enter
                    disabled={isCurrentUserBlocked || isReceiverBlocked}
                />
                <div className={`picker ${open ? "show" : ""}`}>
                    {open && <EmojiPicker onEmojiClick={handleEmoji} />}
                </div>
                <div className="emoji">
                    <img
                        src="./emoji.png"
                        alt="Emoji"
                        onClick={() => setOpen((prev) => !prev)}
                    />
                </div>
                <button className="sendButton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;
