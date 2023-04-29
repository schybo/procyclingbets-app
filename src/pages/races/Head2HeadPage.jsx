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

const Head2Head = ({ match }) => {
  console.log("MATCH");
  console.log(match.params);
  const [showLoading, hideLoading] = useIonLoading();
  const [showToast] = useIonToast();
  const [session] = useState(() => supabase.auth.session());
  const [race, setRace] = useState();
  const [bet, setBet] = useState({
    riderA: "",
    riderB: "",
    odds: 0,
    eachWay: true,
  });

  useEffect(() => {
    getRace();
  }, [session]);

  const getRace = async () => {
    console.log("getting RACE");
    await showLoading();
    try {
      const user = supabase.auth.user();
      let { data, error, status } = await supabase
        .from("races")
        .select()
        .match({ id: match.params.id })
        .maybeSingle();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        console.log("Race data 2");
        console.log(data);
        setRace(data);
      }
    } catch (error) {
      showToast({ message: error.message, duration: 5000 });
    } finally {
      await hideLoading();
    }
  };

  const createBet = async (e, race) => {};

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Add Each Way Bet</IonTitle>
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
          <h1>{`Create Bet for ${race?.name}`}</h1>
          <form onSubmit={() => createBet(bet)}>
            <IonItem>
              <IonLabel>
                <p>Bet</p>
              </IonLabel>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Rider</IonLabel>
              <IonInput
                type="text"
                name="rider"
                value={bet.rider}
                onIonChange={(e) =>
                  setRace({ ...race, rider: e.detail.value ?? "" })
                }
              ></IonInput>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Odds</IonLabel>
              <IonInput
                type="text"
                name="odds"
                value={bet.odds}
                onIonChange={(e) =>
                  setRace({ ...race, odds: e.detail.value ?? 0 })
                }
              ></IonInput>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Stake</IonLabel>
              <IonInput
                type="text"
                name="stake"
                value={bet.stake}
                onIonChange={(e) =>
                  setRace({ ...race, stake: e.detail.value ?? 0 })
                }
              ></IonInput>
            </IonItem>

            <IonItem>
              <IonToggle checked={bet.eachWay}>Each Way?</IonToggle>
            </IonItem>

            <div className="ion-text-center">
              <IonButton fill="clear" type="submit">
                Create Bet
              </IonButton>
            </div>
          </form>
        </div>
      </IonContent>
    </>
  );
};

export default Head2Head;
