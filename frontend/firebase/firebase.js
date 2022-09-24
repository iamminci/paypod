// Firebase is used as off-chain data source to enable vault transfer notifications
// Ideally this would be queried on the UP, but couldn't figure it out in time
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDe6eAJwOWfSpkZkjmotbnX5r4ask1KDX4",
  authDomain: "paypod-b2a9b.firebaseapp.com",
  projectId: "paypod-b2a9b",
  storageBucket: "paypod-b2a9b.appspot.com",
  messagingSenderId: "1022912566342",
  appId: "1:1022912566342:web:ce606d9310656fb5342647",
  measurementId: "G-MKKL9GTTRN",
};

const app = initializeApp(firebaseConfig);
export default getFirestore();
