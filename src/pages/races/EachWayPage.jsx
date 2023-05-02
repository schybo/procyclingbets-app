import React from "react";
import {
  IonBackButton,
  IonButtons,
  IonList,
  IonButton,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
} from "@ionic/react";
import { IonInput, IonItem, IonLabel } from "@ionic/react";
import { useIonRouter } from "@ionic/react";
import { IonNav, IonToggle, useIonLoading, useIonToast } from "@ionic/react";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

const EachWay = ({ match }) => {
  console.log("MATCH");
  console.log(match.params);
  const router = useIonRouter();
  const [showLoading, hideLoading] = useIonLoading();
  const [showToast] = useIonToast();
  const [session] = useState(() => supabase.auth.session());
  const [race, setRace] = useState();
  const [bet, setBet] = useState({
    rider_name: "",
    rider_odds: null,
    amount: null,
    each_way: true,
    each_way_return: 0.25,
    each_way_positions: 3,
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

  const createBet = async (e, bet) => {
    e?.preventDefault();

    console.log("creating bet");
    await showLoading();

    try {
      const user = supabase.auth.user();
      console.log("USER");
      console.log(user);

      const data = {
        ...bet,
        race_id: race.id, // Really should just pull from list of races no?
        user_id: user.id,
        updated_at: new Date(),
      };

      let { error } = await supabase.from("eachWays").insert(data);

      if (error) {
        console.log(error);
        throw error;
      }
    } catch (error) {
      showToast({ message: error.message, duration: 5000 });
    } finally {
      await hideLoading();
      router.push(`/race/view/${race.id}`, "root", "replace");
    }
  };

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
          <IonList>
            <IonItem>
              <h1>{`Create Bet for ${race?.name}`}</h1>
            </IonItem>
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
                  name="rider_name"
                  required={true}
                  placeholder={"Adam Yates"}
                  value={bet.rider_name}
                  onIonChange={(e) =>
                    setBet({ ...bet, rider_name: e.detail.value ?? "" })
                  }
                ></IonInput>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Odds</IonLabel>
                <IonInput
                  type="text"
                  name="rider_odds"
                  required={true}
                  placeholder={121.0}
                  value={bet.rider_odds}
                  onIonChange={(e) =>
                    setBet({ ...bet, rider_odds: e.detail.value ?? 0 })
                  }
                ></IonInput>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Stake</IonLabel>
                <IonInput
                  type="text"
                  name="amount"
                  required={true}
                  placeholder={0.3}
                  value={bet.amount}
                  onIonChange={(e) =>
                    setBet({ ...bet, amount: e.detail.value ?? 0 })
                  }
                ></IonInput>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Positions</IonLabel>
                <IonInput
                  type="text"
                  name="each_way_positions"
                  required={true}
                  value={bet.each_way_positions}
                  onIonChange={(e) =>
                    setBet({ ...bet, each_way_positions: e.detail.value ?? 0 })
                  }
                ></IonInput>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Return</IonLabel>
                <IonInput
                  type="text"
                  name="each_way_return"
                  required={true}
                  value={bet.each_way_return}
                  onIonChange={(e) =>
                    setBet({ ...bet, each_way_return: e.detail.value ?? 0 })
                  }
                ></IonInput>
              </IonItem>

              <IonItem>
                <IonToggle checked={bet.each_way}>Each Way?</IonToggle>
              </IonItem>

              <div className="ion-text-center">
                <IonButton type="submit">Create Bet</IonButton>
              </div>
            </form>
          </IonList>
        </div>
      </IonContent>
    </>
  );
};

export default EachWay;
