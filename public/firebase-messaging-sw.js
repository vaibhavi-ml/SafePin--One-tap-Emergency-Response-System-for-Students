importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC3jGs1IWuhourxEQ8hOjrTMm3IO9apC4A",
  authDomain: "hostel-emergency-locator.firebaseapp.com",
  projectId: "hostel-emergency-locator",
  messagingSenderId: "917765002280",
  appId: "1:917765002280:web:0c75d67c9d9a111233111d",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: "/icon.png",
    }
  );
});
