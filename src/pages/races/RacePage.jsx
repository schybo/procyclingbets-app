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
    getRace();
    getEachWayBets();
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

  const getEachWayBets = async () => {
    console.log("getting Bets for races");
    await showLoading();
    try {
      const user = supabase.auth.user();
      let { data, error, status } = await supabase
        .from("eachWays")
        .select()
        .match({ race_id: match.params.id });

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        console.log("Bets");
        console.log(data);
        setEachWayBets(data);
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
          <IonTitle>{race?.name}</IonTitle>
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
          <IonRouterLink href={`/race/view/${race?.id}/addEachWay`}>
            <IonButton>Create Bet</IonButton>
          </IonRouterLink>
          {eachWayBets.map((ew) => {
            console.log("COOL");
            console.log(ew);
            return (
              <IonItem key={ew?.rider}>
                <IonLabel>{ew?.rider}</IonLabel>
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
