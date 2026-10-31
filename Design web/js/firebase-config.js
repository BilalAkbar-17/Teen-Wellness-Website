const firebaseConfig = {
  apiKey: "AIzaSyAXRlomKWHK3w2QoWPk-MuV8P4CnC6rHpY",
  authDomain: "website-a6e10.firebaseapp.com",
  projectId: "website-a6e10",
  storageBucket: "website-a6e10.firebaseapp.com",
  messagingSenderId: "742043130182",
  appId: "1:742043130182:web:c28e85417d3bae72a52d47",
  measurementId: "G-71XLEKEX72"
};

let firebaseInitialized = false;
let auth = null;
let db = null;

try {

  if (typeof firebase === 'undefined') {
    console.error("Firebase SDK not loaded! Check script tags in HTML");
  } else {

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    firebaseInitialized = true;
    console.log("Firebase app initialized successfully");

    auth = firebase.auth();
    console.log("Firebase auth initialized successfully:", !!auth);

    const settings = {
      cacheSizeBytes: 0,  
      ignoreUndefinedProperties: true
    };

    db = firebase.firestore();
    db.settings(settings);
    console.log("Firebase firestore initialized with cache disabled:", !!db);

    console.log("Attempting to clear cached permissions");

    auth.onAuthStateChanged(function(user) {
      if (user) {
        console.log("User is signed in with UID:", user.uid);

        db.collection('blogPosts').limit(1).get({ source: 'server' })
          .then(() => {
            console.log("✅ Successfully connected to Firestore with read permissions");
          })
          .catch((error) => {
            console.error("❌ Firestore permission test failed:", error);

          });
      } else {
        console.log("No user is signed in");
      }
    });

    console.log("Skipping Firestore persistence to avoid permission caching");

    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        console.log("Auth persistence set to LOCAL");
      })
      .catch((error) => {
        console.error("Error setting auth persistence:", error);
      });
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);

}

