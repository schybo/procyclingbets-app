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
import { useIonRouter } from "@ionic/react";
import { IonNav, useIonLoading, useIonToast } from "@ionic/react";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

const CreateRace = () => {
  const router = useIonRouter();
  const [showLoading, hideLoading] = useIonLoading();
  const [showToast] = useIonToast();
  const [session] = useState(() => supabase.auth.session());
  const createRace = async (e, race) => {
    e?.preventDefault();

    console.log("creating race");
    await showLoading();
    let createdRace = null;
    try {
      const user = supabase.auth.user();
      console.log("USER");
      console.log(user);
      const dataToCreate = {
        ...race,
        user_id: user.id,
        updated_at: new Date(),
      };
      let { data, error } = await supabase
        .from("races")
        .upsert(dataToCreate)
        .select()
        .maybeSingle();

      if (error) {
        throw error;
      }

      console.log("Returned data");
      console.log(data);
      createdRace = data;
    } catch (error) {
      showToast({ message: error.message, duration: 5000 });
    } finally {
      await hideLoading();
      router.push(
        createdRace ? `/race/view/${createdRace.id}` : `/race`,
        "root",
        "replace"
      );
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
          <form onSubmit={(e) => createRace(e, race)}>
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
