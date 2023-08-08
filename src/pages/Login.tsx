import { useState } from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonToast,
  useIonLoading,
} from "@ionic/react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../supabaseClient";

export function LoginPage() {
  // const [email, setEmail] = useState("");

  // const [showLoading, hideLoading] = useIonLoading();
  // const [showToast] = useIonToast();
  // const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  //   console.log();
  //   e.preventDefault();
  //   await showLoading();
  //   try {
  //     await supabase.auth.signIn({ email });
  //     await showToast({ message: "Check your email for the login link!" });
  //   } catch (e: any) {
  //     await showToast({
  //       message: e.error_description || e.message,
  //       duration: 5000,
  //     });
  //   } finally {
  //     await hideLoading();
  //   }
  // };
  return (
    <div>Hello</div>
    // <IonPage>
    //   <IonHeader>
    //     <IonToolbar>
    //       <IonTitle>Login</IonTitle>
    //     </IonToolbar>
    //   </IonHeader>

    //   <IonContent>
    //     {" "}
    //     <Auth
    //       supabaseClient={supabase}
    //       appearance={{ theme: ThemeSupa }}
    //       providers={["google", "facebook", "twitter"]}
    //     />
    //   </IonContent>
    // </IonPage>
  );
}
