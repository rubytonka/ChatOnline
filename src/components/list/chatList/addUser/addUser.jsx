import "./addUser.css"
import { db } from "../../../../lib/firebase"
import { 
    arrayUnion, 
    collection, 
    doc, 
    getDocs, 
    query, 
    serverTimestamp, 
    setDoc, 
    updateDoc, 
    where 
} from "firebase/firestore"
import { useState } from "react"
import { useUserStore } from "../../../../lib/userStore"

const AddUser = () => {
    const [user, setUser] = useState(null)
    const { currentUser } = useUserStore()

    const handleSearch = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const username = formData.get("username")

        try {
            const userRef = collection(db, "users")
            const q = query(userRef, where("username", "==", username))
            const querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
                setUser(querySnapshot.docs[0].data()) 
            } else {
                setUser(null)
                console.log("User not found")
            }
        } catch (err) {
            console.error("Error fetching user:", err)
        }
    }

    const handleAdd = async () => {
        const ChatRef = collection(db, "chats")
        const userChatsRef = collection(db, "userchats")
    
        try {
            // Buat referensi dokumen baru di koleksi "chats"
            const newChatRef = doc(ChatRef)
    
            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: [],
            })
    
            await updateDoc(doc(userChatsRef, user.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverID: currentUser.id,
                    updatedAt: Date.now(),
                }),
            });
    
            await updateDoc(doc(userChatsRef, currentUser.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverID: user.id,
                    updatedAt: Date.now(),
                }),
            })
        } catch (err) {
            console.error("Error adding user:", err)
        }
    }

    return (
        <div className="addUser">
            <form onSubmit={handleSearch}>
                <input type="text" placeholder="Username" name="username" />
                <button type="submit">Search</button>
            </form>
            {user && (
                <div className="user">
                    <div className="detail">
                        <img src={ "./avatar.png"} alt="User Avatar" />
                        <span>{user.username}</span>
                    </div>
                    <button onClick={handleAdd}>Add User</button>
                </div>
            )}
        </div>
    )
}

export default AddUser
