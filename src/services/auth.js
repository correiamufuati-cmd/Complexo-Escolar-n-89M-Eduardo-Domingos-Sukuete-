
import { auth } from "./firebase.js";
import { 
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";


// LOGIN
export async function login(email, password){

  try {

    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return {
      success: true,
      user: result.user
    };


  } catch(error){

    return {
      success: false,
      message: error.message
    };

  }

}


// LOGOUT
export async function logout(){

  await signOut(auth);

}
