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
  const [session] = useState(() => supabase.auth.getSession());
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
    custom_type: null,
    race_id: match.params.id,
    matchup_return: null,
    matchup_legs: null,
    live_bet: false,
    synthetic: false,
    time_trial: false,
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

    const {
      data: { user },
    } = await supabase.auth.getUser();
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
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

      if (data.type == BET_TYPE["matchup"] && data.matchup_return != 0) {
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
        <div className="pt-8 pb-20">
          <div className="flex w-full items-center justify-center h-full">
            <IonList>
              <form onSubmit={(e) => createBet(e, bet)}>
                <IonItem>
                  <IonLabel position="stacked">Type</IonLabel>
                  <IonSelect
                    className="select-icon-fix"
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

                {bet?.type && bet?.type === BET_TYPE["custom"] && (
                  <IonItem>
                    <IonLabel position="stacked">Custom Type</IonLabel>
                    <IonInput
                      type="text"
                      name="custom_type"
                      required={true}
                      placeholder={'Straight Forecast'}
                      value={bet.custom_type}
                      onIonChange={(e) =>
                        setBet({ ...bet, custom_type: e.detail.value ?? 0 })
                      }
                    ></IonInput>
                  </IonItem>
                )}

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
                  <>
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

                    <IonItem>
                      <IonLabel position="stacked">Number of Legs</IonLabel>
                      <IonInput
                        type="text"
                        name="matchup_legs"
                        required={true}
                        placeholder={3}
                        value={bet.matchup_legs}
                        onIonChange={(e) =>
                          setBet({ ...bet, matchup_legs: e.detail.value ?? 0 })
                        }
                      ></IonInput>
                    </IonItem>
                  </>
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

                {bet?.type &&
                  bet?.type !== BET_TYPE["matchup"] &&
                  bet?.type !== BET_TYPE["top3"] &&
                  bet?.type !== BET_TYPE["top10"] &&
                  bet?.type !== BET_TYPE["custom"] && (
                    <>
                      <IonItem>
                        <IonLabel position="stacked">Is Each Way?</IonLabel>
                        <IonToggle
                          checked={bet.each_way}
                          onIonChange={(e) =>
                            setBet({ ...bet, each_way: !bet.each_way })
                          }
                        >
                          Each Way?
                        </IonToggle>
                      </IonItem>
                      {bet.each_way && (
                        <IonItem>
                          <IonLabel position="stacked">Each Way Return</IonLabel>
                          <IonInput
                            type="text"
                            name="each_way_return"
                            required={true}
                            value={bet.each_way_return}
                            onIonChange={(e) =>
                              setBet({
                                ...bet,
                                each_way_return: e.detail.value ?? 0,
                              })
                            }
                          ></IonInput>
                        </IonItem>
                      )}
                    </>
                  )}
                <IonItem>
                  <IonLabel position="stacked">Live Bet?</IonLabel>
                  <IonToggle
                    checked={bet.live_bet}
                    onIonChange={(e) =>
                      setBet({ ...bet, live_bet: !bet.live_bet })
                    }
                  >
                    Live Bet?
                  </IonToggle>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Synthetic?</IonLabel>
                  <IonToggle
                    checked={bet.synthetic}
                    onIonChange={(e) =>
                      setBet({ ...bet, synthetic: !bet.synthetic })
                    }
                  >
                    Synthetic?
                  </IonToggle>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Time Trial?</IonLabel>
                  <IonToggle
                    checked={bet.time_trial}
                    onIonChange={(e) =>
                      setBet({ ...bet, time_trial: !bet.time_trial })
                    }
                  >
                    Time Trial?
                  </IonToggle>
                </IonItem>

                <div className="ion-text-center mt-8">
                  <button type="submit" className="text-white bg-gradient-to-r inline-flex items-center from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-sm text-sm px-5 py-2.5 text-center mr-2 mb-2">Create Bet</button>
                </div>
              </form>
            </IonList>
          </div>
        </div>
      </IonContent>
    </>
  );
};

export default EachWay;
