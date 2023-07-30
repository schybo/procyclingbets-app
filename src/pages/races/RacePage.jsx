import React from "react";
import {
  IonBackButton,
  IonButtons,
  IonButton,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonRouterLink,
} from "@ionic/react";
import { IonInput, IonItem, IonLabel } from "@ionic/react";
import { IonNav, useIonLoading, useIonToast } from "@ionic/react";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

const Race = ({ match }) => {
  console.log("MATCH");
  console.log(match.params);
  const [showLoading, hideLoading] = useIonLoading();
  const [showToast] = useIonToast();
  const [session] = useState(() => supabase.auth.session());
  const [race, setRace] = useState();
  const [eachWayBets, setEachWayBets] = useState([]);

  useEffect(() => {
    getRaceAndBets();
  }, [session]);

  const getRaceAndBets = async () => {
    await showLoading();
    try {
      await getRace();
      await getEachWayBets();
    } catch (error) {
      showToast({ message: error.message, duration: 5000 });
    } finally {
      console.log("Hide loading");
      await hideLoading();
    }
  };

  const getRace = async () => {
    console.log("Getting RACE");

    const user = supabase.auth.user();
    let { data, error, status } = await supabase
      .from("races")
      .select()
      .match({ id: match.params.id })
      .eq("user_id", user.id)
      .maybeSingle();

    if (error && status !== 406) {
      throw error;
    }

    if (data) {
      console.log("Race data 2");
      console.log(data);
      setRace(data);
    }
  };

  const getEachWayBets = async () => {
    console.log("Getting Bets for races");
    const user = supabase.auth.user();
    let { data, error, status } = await supabase
      .from("eachWays")
      .select()
      .match({ race_id: match.params.id })
      .eq("user_id", user.id);

    if (error && status !== 406) {
      throw error;
    }

    if (data) {
      console.log("Bets");
      console.log(data);
      setEachWayBets(data);
    }
  };
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{race?.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "10%",
          }}
        >
          <IonRouterLink href={`/race/view/${race?.id}/addEachWay`}>
            <IonButton>Create Bet</IonButton>
          </IonRouterLink>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "90%",
          }}
        >
          {eachWayBets.map((ew) => {
            console.log("COOL");
            console.log(ew);
            return (
              <IonItem key={`bet-${ew?.id}`}>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>{ew?.rider_name}</IonCardTitle>
                    <IonCardSubtitle>{ew?.rider_odds}</IonCardSubtitle>
                  </IonCardHeader>

                  <IonCardContent>{`Stake: ${ew?.amount}`}</IonCardContent>
                </IonCard>
              </IonItem>
            );
          })}
          {/* <IonRouterLink href={`/race/view/${race?.id}/addHead2Head`}>
            <IonButton>Create Match Up</IonButton>
          </IonRouterLink> */}
        </div>
      </IonContent>
    </>
  );
};

export default Race;
