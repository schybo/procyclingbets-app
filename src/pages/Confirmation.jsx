import React from "react";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useIonLoading, useIonRouter } from "@ionic/react";
import { IonContent, IonHeader, IonTitle, IonToolbar } from "@ionic/react";

const ConfirmationPage = () => {
  const [showLoading, hideLoading] = useIonLoading();
  const [access, setAccess] = useState();
  const [refresh, setRefresh] = useState();
  const router = useIonRouter();

  useEffect(() => {
      // showLoading()
      const hash = window.location.hash;
      const parts = hash.replace('#', '').split('&');
      for (const item of parts) {
          let [key, value] = item.split('=');
          if (key === 'access_token') setAccess(value);
          if (key === 'refresh_token') setRefresh(value);
      }
  }, []);

  useEffect(() => {
      if (!access || !refresh) return;
      const setSessionfunc = async (access_token, refresh_token) => {
          await supabase.auth.setSession({ access_token, refresh_token });
          router.push('/');
      };
      setSessionfunc(access, refresh);
  }, [access, refresh]);

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Confirmation</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
      </IonContent>
    </>
  );
};

export default ConfirmationPage;
