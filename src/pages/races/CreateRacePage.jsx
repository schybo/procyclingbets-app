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
  const [session] = useState(() => supabase.auth.getSession());
  const createRace = async (e, race) => {
    e?.preventDefault();

    console.log("creating race");
    await showLoading();
    let createdRace = null;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
      <IonHeader className="flex flex-row items-center justify-center h-[57px]">
        <IonToolbar className="inline-block">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/race"></IonBackButton>
          </IonButtons>
          <div className="flex flex-row items-center justify-center">
            <img
              className="h-8 ml-1 mr-2"
              src="assets/icon/iconClear.png"
            ></img>
            <IonTitle className="mx-0 px-0 h-8">Create Race</IonTitle>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent class="ion-padding">
        <div className="pt-8 pb-20">
          <div className="flex items-center flex-wrap flex-row justify-center mt-32">
            <h1 className="text-xl font-bold w-full block text-center">
              Create Race
            </h1>
            <form onSubmit={(e) => createRace(e, race)}>
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

              <div className="ion-text-center mt-8">
                <button
                  type="submit"
                  className="text-white bg-gradient-to-r inline-flex items-center from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-sm text-sm px-5 py-2.5 text-center mr-2 mb-2"
                >
                  Create Race
                </button>
              </div>
            </form>
          </div>
        </div>
      </IonContent>
    </>
  );
};

export default CreateRace;
