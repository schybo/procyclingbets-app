import React from "react";
import {
  IonList,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonButton,
} from "@ionic/react";
import { IonInput, IonItem, IonLabel } from "@ionic/react";
import { IonNav, useIonLoading, useIonToast } from "@ionic/react";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { race } from "q";
import {
  capitalizeFirstLetter,
  currencyFormatter,
  BET_STATUS,
} from "../../helpers/helpers";

const ViewRaces = () => {
  const [showLoading, hideLoading] = useIonLoading();
  const [showToast] = useIonToast();
  const [session] = useState(() => supabase.auth.session());
  const [races, setRaces] = useState([]);
  const [eachWayBets, setEachWayBets] = useState([]);
  const [totalWon, setTotalWon] = useState({});
  const [totalLost, setTotalLost] = useState({});
  const [totalOpen, setTotalOpen] = useState({});

  useEffect(() => {
    getRacesAndBets();
  }, [session]);

  const getRacesAndBets = async () => {
    await showLoading();
    try {
      await getRaces();
      await getEachWayBets();
    } catch (error) {
      showToast({ message: error.message, duration: 5000 });
    } finally {
      console.log("Hide loading");
      await hideLoading();
    }
  };

  const getRaces = async () => {
    console.log("getting races");
    await showLoading();
    try {
      const user = supabase.auth.user();
      let { data, error, status } = await supabase
        .from("races")
        .select()
        .eq("user_id", user.id);

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        console.log("HEELOO");
        console.log("Race data");
        console.log(data);
        setRaces(data);

        let totalWon = {};
        let totalLost = {};
        let totalOpen = {};
        data.map((race) => {
          totalWon[race.id] = 0;
          totalLost[race.id] = 0;
          totalOpen[race.id] = 0;
        });
        setTotalOpen(totalOpen);
        setTotalWon(totalWon);
        setTotalLost(totalLost);
      }
    } catch (error) {
      showToast({ message: error.message, duration: 5000 });
    } finally {
      await hideLoading();
    }
  };

  const getEachWayBets = async () => {
    console.log("Getting Bets for races");
    const user = supabase.auth.user();
    let { data, error, status } = await supabase
      .from("eachWays")
      .select()
      .eq("user_id", user.id);

    if (error && status !== 406) {
      throw error;
    }

    let tw = totalWon;
    let tl = totalLost;
    let to = totalOpen;
    if (data) {
      console.log("Bets");
      console.log(data);
      setEachWayBets(data);
      data.map((ew) => {
        if (ew.status === BET_STATUS["won"]) {
          tw[ew.race_id] += ew.amount * ew.rider_odds;
        } else if (ew.status === BET_STATUS["lost"]) {
          tl[ew.race_id] += ew.amount;
        } else if (ew.status === BET_STATUS["placed"]) {
          tw[ew.race_id] += ew.amount * (ew.rider_odds * ew.each_way_return);
        } else if (ew.status === BET_STATUS["void"]) {
          tw[ew.race_id] += ew.amount;
        } else {
          to[ew.race_id] += ew.amount;
        }
      });
      setTotalOpen(to);
      setTotalWon(tw);
      setTotalLost(tl);
    }
  };

  const deleteRace = async (raceId) => {
    await showLoading();
    try {
      let { error, status } = await supabase
        .from("races")
        .delete()
        .eq("id", raceId);

      if (error && status !== 406) {
        throw error;
      }

      // Refresh the list of races
      await getRaces();
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
          <IonTitle>Races</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div
          className="mt-20 mb-32"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "100%",
          }}
        >
          <IonList>
            {races.map((r) => {
              console.log("COOL");
              console.log(r);
              return (
                <IonItem key={r?.name}>
                  <div class="max-w-sm p-6 mb-4 w-full bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                    <a href={`/race/view/${r.id}`}>
                      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {r?.name}
                      </h5>
                    </a>
                    <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
                      <h2>Total Won: {totalWon[r?.id]}</h2>
                      <h2>Total Lost: {totalLost[r?.id]}</h2>
                      <h2>Total Open: {totalOpen[r?.id]}</h2>
                    </p>
                    <IonButton
                      size="small"
                      routerLink={`/race/view/${r.id}`}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      View
                      <svg
                        class="w-3.5 h-3.5 ml-2"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 10"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M1 5h12m0 0L9 1m4 4L9 9"
                        />
                      </svg>
                    </IonButton>
                    <IonButton
                      onClick={() => deleteRace(r?.id)}
                      size="small"
                      color="danger"
                    >
                      Delete
                    </IonButton>
                  </div>
                </IonItem>
              );
            })}
          </IonList>
        </div>
      </IonContent>
    </>
  );
};

export default ViewRaces;
