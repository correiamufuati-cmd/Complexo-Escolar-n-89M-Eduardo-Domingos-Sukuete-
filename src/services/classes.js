import { app } from "./firebase.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


alert("classes.js iniciou");


const db = getFirestore(app);


alert("Firebase ligado");
