import React from "react";
import {
  IonList,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonButton,
  useIonRouter,
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
  const router = useIonRouter();
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
      <div className="mt-20 mb-32 w-full">
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
                  <div
                    className="inline-flex rounded-md shadow-sm"
                    role="group"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/race/view/${r.id}`, "forward", "replace")
                      }
                      className="text-white inline-flex items-center bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className="w-3.5 h-3.5 mr-2"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRace(r?.id)}
                      className="text-white bg-gradient-to-r inline-flex items-center from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
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
                </div>
              </IonItem>
            );
          })}
        </IonList>
      </div>
    </>
  );
};

export default ViewRaces;
