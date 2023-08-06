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
  useIonRouter,
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
  calculateWinnings,
  kebabCase,
  BET_TYPE,
} from "../../helpers/helpers";
import { IonFab, IonFabButton, IonFabList, IonIcon } from "@ionic/react";
import { add } from "ionicons/icons";

const Race = ({ match }) => {
  console.log("MATCH");
  console.log(match.params);
  const router = useIonRouter();
  const [showLoading, hideLoading] = useIonLoading();
  const [showToast] = useIonToast();
  const [session] = useState(() => supabase.auth.session());
  const [race, setRace] = useState();
  const [betStatus, setStatus] = useState([]);
  const [total, setTotal] = useState();
  const [totalWon, setTotalWon] = useState();
  const [totalLost, setTotalLost] = useState();
  const [totalOpen, setTotalOpen] = useState();
  const [ridersInfo, setRidersInfo] = useState();
  const [eachWayBets, setEachWayBets] = useState([]);

  useEffect(() => {
    getRaceAndBets();
  }, [session]);

  useEffect(() => {
    let result = calculateWinnings(eachWayBets);
    setTotal(result["total"][match.params.id] || 0);
    setTotalOpen(result["open"][match.params.id] || 0);
    setTotalWon(result["won"][match.params.id] || 0);
    setTotalLost(result["lost"][match.params.id] || 0);
  }, [eachWayBets]);

  const getRaceAndBets = async () => {
    await showLoading();
    try {
      await getRace();
      await getRidersInfo();
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

    if (data) {
      console.log("Bets");
      console.log(data);
      setEachWayBets(data);
      // let result = calculateWinnings(data);
      console.log("WINNINGS");
      // console.log(result);
      // setTotal(result["total"][match.params.id]);
      // setTotalOpen(result["open"][match.params.id]);
      // setTotalWon(result["won"][match.params.id]);
      // setTotalLost(result["lost"][match.params.id]);
    }
  };

  const getRidersInfo = async () => {
    console.log("Getting Rider Info");

    let { data, error, status } = await supabase.from("riders").select();

    if (error && status !== 406) {
      throw error;
    }

    let riderDict = {};
    if (data) {
      console.log("riders");
      console.log(data);
      data.map((r) => {
        riderDict[r.rider_key] = r;
      });
      setRidersInfo(riderDict);
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

      let newBets = eachWayBets.map((b) => {
        if (b.id === bet.id) {
          b.status = s;
        }
        return b;
      });
      setEachWayBets(newBets);

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

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{race?.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="flex items-center flex-row flex-wrap justify-center mt-12 mb-8 text-center">
          <IonText>
            <h1 className="text-xl font-bold mb-2">
              Total Bet: {currencyFormatter.format(total)}
            </h1>
            <h2 className="text-lg mt-2">
              Total Won: {currencyFormatter.format(totalWon)}
            </h2>
            <h2 className="text-lg mt-0.5">
              Total Lost: {currencyFormatter.format(totalLost)}
            </h2>
            <h2 className="text-lg mt-0.5">
              Total Open: {currencyFormatter.format(totalOpen)}
            </h2>
          </IonText>
        </div>
        <div className="w-full flex flex-row flex-wrap items-center justify-center mb-32">
          {eachWayBets.map((ew) => {
            let image = `https://www.procyclingstats.com/${
              ridersInfo[kebabCase(ew?.rider_name)]?.image_url
            }`;
            return (
              <IonCard
                color="light"
                key={`bet-${ew?.id}`}
                className="w-full md:w-64 mx-6 flex flex-row items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                {/* TODO: Placeholder */}
                <object
                  data="https://stackoverflow.com/does-not-exist.png"
                  type="image/png"
                  className="w-36"
                >
                  <img
                    className="w-36 rounded-t-lg h-auto md:w-48 md:rounded-none md:rounded-l-lg"
                    src={image}
                    alt=""
                  ></img>
                </object>
                <div className="flex flex-col justify-between p-4 leading-normal w-full">
                  <div className="text-lg font-bold">
                    {ew?.type == BET_TYPE["matchup"]
                      ? "Matchup"
                      : ew?.rider_name}
                  </div>
                  <div>
                    <span className="font-bold">Odds: </span>
                    {ew?.rider_odds && ew?.type != BET_TYPE["matchup"]
                      ? ew.rider_odds.toFixed(2)
                      : ew?.rider_odds}
                  </div>

                  <div>
                    <span className="font-bold">Stake: </span>
                    {`${currencyFormatter.format(
                      ew?.amount *
                        (ew?.type != BET_TYPE["matchup"] && ew?.each_way
                          ? 2
                          : 1)
                    )}`}
                  </div>
                  <div className="flex flex-row justify-start items-center mt-2">
                    <label className="mb-2 mr-4 font-bold">Status:</label>
                    <IonSelect
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 py-1 px-2 mb-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
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
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteBet(ew?.id)}
                    className="text-white w-24 bg-gradient-to-r inline-flex items-center from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-1 text-center mr-2 mb-2 mt-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="w-3.5 h-3.5 mr-2"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              </IonCard>
            );
          })}
        </div>
        <IonFab
          className="mb-16"
          slot="fixed"
          vertical="bottom"
          horizontal="end"
        >
          <IonFabButton
            href={`/race/view/${race?.id}/addEachWay`}
            routerDirection="forward"
          >
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </>
  );
};

export default Race;
