import React from "react";
import { IonContent, IonHeader, IonTitle, IonToolbar } from "@ionic/react";
import {
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  useIonLoading,
  useIonToast,
  useIonRouter,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

interface RaceState {
  name: string;
}

const HomePage2 = () => {
  const [showLoading, hideLoading] = useIonLoading();
  const [showToast] = useIonToast();
  const [session] = useState(() => supabase.auth.session());
  const [races, setRaces] = useState<RaceState[]>([]);
  const [race, setRace] = useState({
    name: "",
    user_id: session?.user?.id,
  });
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
        .eq("user_id", user!.id);

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        console.log("Race data");
        console.log(data);
        setRaces(data);
      }
    } catch (error: any) {
      showToast({ message: error.message, duration: 5000 });
    } finally {
      await hideLoading();
    }
  };
  const createRace = async (e?: any) => {
    e?.preventDefault();

    console.log("creating race");
    await showLoading();

    try {
      const user = supabase.auth.user();
      console.log("USER");
      console.log(user);

      const data = {
        ...race,
        user_id: user!.id,
        updated_at: new Date(),
      };

      let { error } = await supabase.from("races").insert(data);

      if (error) {
        throw error;
      }
    } catch (error: any) {
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
          <form onSubmit={createRace}>
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

export default HomePage2;
