import { createServerFn } from "@tanstack/react-start";

export const getFirebaseConfig = createServerFn({ method: "GET" }).handler(async () => {
  return {
    apiKey: (process.env["GOOGLE_API_KEY"] ?? "").trim(),
    authDomain: "portfolio-ce615.firebaseapp.com",
    projectId: "portfolio-ce615",
    storageBucket: "portfolio-ce615.appspot.com",
    messagingSenderId: "274495429625",
    appId: "1:274495429625:web:d0c6efecd41854e616fb28",
  };
});
