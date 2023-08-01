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
  IonText,
  IonSelect,
  IonSelectOption,
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
import {
  capitalizeFirstLetter,
  currencyFormatter,
  BET_STATUS,
} from "../../helpers/helpers";

const Race = ({ match }) => {
  console.log("MATCH");
  console.log(match.params);
  const [showLoading, hideLoading] = useIonLoading();
  const [showToast] = useIonToast();
  const [session] = useState(() => supabase.auth.session());
  const [race, setRace] = useState();
  const [betStatus, setStatus] = useState([]);
  const [totalWon, setTotalWon] = useState();
  const [totalLost, setTotalLost] = useState();
  const [totalOpen, setTotalOpen] = useState();
  const [eachWayBets, setEachWayBets] = useState([]);

  useEffect(() => {
    getRaceAndBets();
  }, [session]);

  const getRaceAndBets = async () => {
    await showLoading();
    try {
      await getRace();
      await getEachWayBets();
      await getBetStatusOptions();
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

    let totalWon = 0;
    let totalLost = 0;
    let totalOpen = 0;
    if (data) {
      console.log("Bets");
      console.log(data);
      setEachWayBets(data);
      data.map((ew) => {
        if (ew.status === BET_STATUS["won"]) {
          totalWon += ew.amount * ew.rider_odds;
        } else if (ew.status === BET_STATUS["lost"]) {
          totalLost += ew.amount;
        } else if (ew.status === BET_STATUS["placed"]) {
          totalWon += ew.amount * (ew.rider_odds * ew.each_way_return);
        } else if (ew.status === BET_STATUS["void"]) {
          totalWon += ew.amount;
        } else {
          totalOpen += ew.amount;
        }
      });
      setTotalOpen(totalOpen);
      setTotalWon(totalWon);
      setTotalLost(totalLost);
    }
  };

  const getBetStatusOptions = async () => {
    console.log("Getting STatus");

    let { data, error, status } = await supabase.from("betStatus").select();

    if (error && status !== 406) {
      throw error;
    }

    if (data) {
      console.log("Statii");
      console.log(data);
      setStatus(data);
    }
  };

  const setBetStatus = async (bet, s) => {
    await showLoading();
    try {
      console.log("BET");
      console.log(bet);
      console.log("Status");
      console.log(s);

      const { error, status } = await supabase
        .from("eachWays")
        .update({ status: s })
        .eq("id", bet.id);

      if (error && status !== 406) {
        throw error;
      }
    } catch (error) {
      showToast({ message: error.message, duration: 5000 });
    } finally {
      await hideLoading();
    }
  };

  const deleteBet = async (betId) => {
    await showLoading();
    try {
      let { error, status } = await supabase
        .from("eachWays")
        .delete()
        .eq("id", betId);

      if (error && status !== 406) {
        throw error;
      }

      // Refresh the list of bets
      await getEachWayBets();
    } catch (error) {
      showToast({ message: error.message, duration: 5000 });
    } finally {
      await hideLoading();
    }
  };

  let total = eachWayBets.reduce((acc, cv) => acc + cv?.amount, 0);
  total = currencyFormatter.format(total);

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
            height: "30%",
          }}
        >
          <IonText>
            <h1>Total Bet: {total}</h1>
            <h2>Total Won: {totalWon}</h2>
            <h2>Total Lost: {totalLost}</h2>
            <h2>Total Open: {totalOpen}</h2>
          </IonText>
        </div>
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
          }}
        >
          {eachWayBets.map((ew) => {
            console.log("COOL");
            console.log(ew);
            return (
              <IonItem
                key={`bet-${ew?.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <IonCard
                  color="light"
                  style={{
                    width: "100%",
                  }}
                >
                  <IonCardHeader>
                    <IonCardTitle>{ew?.rider_name}</IonCardTitle>
                    <IonCardSubtitle>{ew?.rider_odds}</IonCardSubtitle>
                  </IonCardHeader>

                  <IonCardContent>{`Stake: ${ew?.amount}`}</IonCardContent>
                  <IonButton
                    size="small"
                    color="danger"
                    onClick={() => deleteBet(ew?.id)}
                  >
                    Delete
                  </IonButton>
                  {ew.status && (
                    <IonSelect
                      label="Status"
                      value={ew.status}
                      onIonChange={(e) => setBetStatus(ew, e.detail.value)}
                    >
                      {betStatus.map((bs) => {
                        console.log("bt");
                        console.log(bs);
                        return (
                          <IonSelectOption key={bs?.id} value={bs?.id}>
                            {capitalizeFirstLetter(bs?.status)}
                          </IonSelectOption>
                        );
                      })}
                    </IonSelect>
                  )}
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
