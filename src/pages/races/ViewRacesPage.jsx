import React from "react";
import {
  IonList,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonButton,
} from "@ionic/react";
import { IonInput, IonItem, IonLabel } from "@ionic/react";
import { IonNav, useIonLoading, useIonToast } from "@ionic/react";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { race } from "q";

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
        .select()
        .eq("user_id", user.id);

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        console.log("HEELOO");
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

  const deleteRace = async (raceId) => {
    await showLoading();
    try {
      let { error, status } = await supabase
        .from("races")
        .delete()
        .eq("id", raceId);

      if (error && status !== 406) {
        throw error;
      }

      // Refresh the list of races
      await getRaces();
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
            width: "100%",
          }}
        >
          <IonList>
            {races.map((r) => {
              console.log("COOL");
              console.log(r);
              return (
                <IonItem key={r?.name}>
                  <IonLabel>{r?.name}</IonLabel>
                  <IonButton size="small" routerLink={`/race/view/${r.id}`}>
                    View
                  </IonButton>
                  <IonButton
                    onClick={() => deleteRace(r?.id)}
                    size="small"
                    color="danger"
                  >
                    Delete
                  </IonButton>
                </IonItem>
              );
            })}
          </IonList>
        </div>
      </IonContent>
    </>
  );
};

export default ViewRaces;
