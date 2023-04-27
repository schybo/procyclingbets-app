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

const CreateRace = () => {
  const [showLoading, hideLoading] = useIonLoading();
  const [showToast] = useIonToast();
  const [session] = useState(() => supabase.auth.session());
  const createRace = async (e, race) => {
    e?.preventDefault();

    console.log("creating race");
    await showLoading();

    try {
      const user = supabase.auth.user();
      console.log("USER");
      console.log(user);

      const data = {
        ...race,
        user_id: user.id,
        updated_at: new Date(),
      };

      let { error } = await supabase.from("races").insert(data);

      if (error) {
        throw error;
      }
    } catch (error) {
      showToast({ message: error.message, duration: 5000 });
    } finally {
      await hideLoading();
    }
  };
  const [race, setRace] = useState({
    name: "",
  });
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton></IonBackButton>
          </IonButtons>
          <IonTitle>Create Race</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent class="ion-padding">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <h1>Create Race</h1>
          <form onSubmit={() => createRace(race)}>
            <IonItem>
              <IonLabel>
                <p>Race</p>
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Name</IonLabel>
              <IonInput
                type="text"
                name="name"
                value={race.name}
                onIonChange={(e) =>
                  setRace({ ...race, name: e.detail.value ?? "" })
                }
              ></IonInput>
            </IonItem>

            <div className="ion-text-center">
              <IonButton fill="clear" type="submit">
                Create Race
              </IonButton>
            </div>
          </form>
        </div>
      </IonContent>
    </>
  );
};

export default CreateRace;
