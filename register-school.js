import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById("schoolForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const schoolName = document.getElementById("schoolName").value;
  const address = document.getElementById("address").value;
  const adminName = document.getElementById("adminName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    // 1. Criar utilizador (gestor)
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    const user = userCredential.user;

    const schoolId = user.uid;

    // 2. Criar escola
    await setDoc(doc(db, "schools", schoolId), {
      name: schoolName,
      address: address,
      createdAt: new Date()
    });

    // 3. Criar utilizador gestor
    await setDoc(doc(db, "users", user.uid), {
      name: adminName,
      email: email,
      role: "gestor",
      schoolId: schoolId
    });

    alert("Escola criada com sucesso!");
    window.location.href = "/login.html";

  } catch (error) {
    alert(error.message);
  }
});
