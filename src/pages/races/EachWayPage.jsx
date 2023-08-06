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
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { IonInput, IonItem, IonLabel } from "@ionic/react";
import { useIonRouter } from "@ionic/react";
import { IonNav, IonToggle, useIonLoading, useIonToast } from "@ionic/react";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { BET_TYPE, capitalizeFirstLetter, round } from "../../helpers/helpers";

const EachWay = ({ match }) => {
  console.log("MATCH");
  console.log(match.params);
  const router = useIonRouter();
  const [showLoading, hideLoading] = useIonLoading();
  const [showToast] = useIonToast();
  const [session] = useState(() => supabase.auth.session());
  const [race, setRace] = useState();
  const [betTypes, setTypes] = useState([]);
  const [bet, setBet] = useState({
    rider_name: "",
    rider_odds: null,
    amount: null,
    each_way: true,
    each_way_return: 0.25,
    each_way_positions: 3,
    status: 5,
    type: 1,
    matchup_return: null,
    live_bet: false,
  });

  useEffect(() => {
    getData();
  }, [session]);

  const getData = async () => {
    await showLoading();
    try {
      await getRace();
      await getEachWayTypeOptions();
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

  const getEachWayTypeOptions = async () => {
    console.log("Getting RACE");

    let { data, error, status } = await supabase.from("eachWayType").select();

    if (error && status !== 406) {
      throw error;
    }

    if (data) {
      console.log("Types");
      console.log(data);
      setTypes(data);
    }
  };

  const createBet = async (e, bet) => {
    e?.preventDefault();

    console.log("creating bet");
    console.log(bet);
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

      if (data.amount === 0) {
        showToast({
          message: "Can't have no amount for bet",
          duration: 5000,
        });
        throw "Can't have no amount for bet";
      }

      if (data.matchup_return != 0) {
        data.rider_odds = round(data.matchup_return / data.amount, 2);
      }

      console.log(data);
      let { error } = await supabase.from("eachWays").insert(data);

      if (error) {
        console.log("ERROR");
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
        <div className="flex w-full items-center justify-center h-full">
          <IonList>
            <form onSubmit={(e) => createBet(e, bet)}>
              <IonItem>
                <IonLabel position="stacked">Type</IonLabel>
                <IonSelect
                  label="Type"
                  placeholder="Overall"
                  value={bet?.type}
                  onIonChange={(e) =>
                    setBet({ ...bet, type: e.detail.value ?? 0 })
                  }
                >
                  {betTypes.map((bt) => {
                    console.log("bt");
                    console.log(bt);
                    return (
                      <IonSelectOption key={bt?.id} value={bt?.id}>
                        {capitalizeFirstLetter(bt?.type)}
                      </IonSelectOption>
                    );
                  })}
                </IonSelect>
              </IonItem>

              {bet?.type && bet?.type !== BET_TYPE["matchup"] && (
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
              )}

              {bet?.type && bet?.type !== BET_TYPE["matchup"] && (
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
              )}

              {bet?.type && bet?.type === BET_TYPE["matchup"] && (
                <IonItem>
                  <IonLabel position="stacked">Matchup Return</IonLabel>
                  <IonInput
                    type="text"
                    name="matchup_return"
                    required={true}
                    placeholder={121.0}
                    value={bet.matchup_return}
                    onIonChange={(e) =>
                      setBet({ ...bet, matchup_return: e.detail.value ?? 0 })
                    }
                  ></IonInput>
                </IonItem>
              )}

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

              {/* <IonItem>
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
              </IonItem> */}

              {bet?.type && bet?.type !== BET_TYPE["matchup"] && (
                <>
                  <IonItem>
                    <IonLabel position="stacked">Each Way Return</IonLabel>
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
                    <IonLabel position="stacked">Is Each Way?</IonLabel>
                    <IonToggle checked={bet.each_way}>Each Way?</IonToggle>
                  </IonItem>
                </>
              )}
              <IonItem>
                <IonLabel position="stacked">Live Bet?</IonLabel>
                <IonToggle checked={bet.live_bet}>Live Bet?</IonToggle>
              </IonItem>

              <div className="ion-text-center mt-8">
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
