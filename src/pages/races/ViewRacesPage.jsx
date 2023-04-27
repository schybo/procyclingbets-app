import React from "react";
import {
  IonBackButton,
  IonButtons,
  IonButton,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
} from "@ionic/react";
import { IonInput, IonItem, IonLabel } from "@ionic/react";
import { IonNav, useIonLoading, useIonToast } from "@ionic/react";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

const ViewRaces = () => {
  const [showLoading, hideLoading] = useIonLoading();
  const [showToast] = useIonToast();
  const [session] = useState(() => supabase.auth.session());
  const [races, setRaces] = useState([]);

  useEffect(() => {
    getRaces();
  }, [session]);
  const getRaces = async () => {
    console.log("getting races");
    await showLoading();
    try {
      const user = supabase.auth.user();
      let { data, error, status } = await supabase
        .from("races")
        .select(`name`)
        .eq("user_id", user.id);

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        console.log("Race data");
        console.log(data);
        setRaces(data);
      }
    } catch (error) {
      showToast({ message: error.message, duration: 5000 });
    } finally {
      await hideLoading();
    }
  };
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Races</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          {races.map((r) => {
            console.log("COOL");
            console.log(r);
            return (
              <IonItem>
                <IonLabel>
                  <p>{r?.name}</p>
                </IonLabel>
              </IonItem>
            );
          })}
        </div>
      </IonContent>
    </>
  );
};

export default ViewRaces;
