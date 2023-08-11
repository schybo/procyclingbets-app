import React from "react";
import {
  IonList,
  IonCard,
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
  calculateWinnings,
  currencyFormatter,
  BET_STATUS,
} from "../../helpers/helpers";

const ViewRaces = () => {
  const [showLoading, hideLoading] = useIonLoading();
  const [showToast] = useIonToast();
  const router = useIonRouter();
  const [session, setSession] = useState(null);
  const [races, setRaces] = useState([]);
  const [eachWayBets, setEachWayBets] = useState([]);
  const [total, setTotal] = useState({});
  const [totalWon, setTotalWon] = useState({});
  const [totalLost, setTotalLost] = useState({});
  const [totalOpen, setTotalOpen] = useState({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    getRacesAndBets();
    return () => {};
  }, [session]);

  useEffect(() => {
    // Assuming this comes after races
    let result = calculateWinnings(eachWayBets);

    // If race has noooooo bets yet, we need to set default jic
    races.map((r) => {
      let options = ["total", "open", "won", "lost"];
      options.map((opt) => {
        result[opt][r.id] = r.id in result[opt] ? result[opt][r.id] : 0;
      });
    });

    setTotal(result["total"]);
    setTotalOpen(result["open"]);
    setTotalWon(result["won"]);
    setTotalLost(result["lost"]);
  }, [eachWayBets]);

  const getRacesAndBets = async () => {
    try {
      // await showLoading();
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
    // await showLoading();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let { data, error, status } = await supabase
        .from("races")
        .select()
        .eq("user_id", user.id);

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        console.log("Race data");
        console.log(data);
        setRaces(data);

        let totalWon = {};
        let totalLost = {};
        let totalOpen = {};
        let total = {};
        data.map((race) => {
          totalWon[race.id] = 0;
          totalLost[race.id] = 0;
          totalOpen[race.id] = 0;
          total[race.id] = 0;
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
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let { data, error, status } = await supabase
      .from("eachWays")
      .select()
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
      <div className="w-full">
        <div className="w-full flex flex-row flex-wrap items-center justify-center">
          {races.map((r) => {
            return (
              <IonCard
                color="light"
                key={`race-${r?.id}`}
                className="w-full md:w-64 mx-6 flex flex-row flex-wrap items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <div className="flex flex-col justify-between p-4 leading-normal w-full">
                  <div className="text-lg font-bold">
                    <a href={`/race/view/${r.id}`}>
                      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {r?.name}
                      </h5>
                    </a>
                  </div>
                  <div>
                    <span className="font-bold">Total Bet: </span>
                    {currencyFormatter.format(total[r?.id])}
                  </div>
                  <div>
                    <span className="font-bold">Total Won: </span>
                    {currencyFormatter.format(totalWon[r?.id])}
                  </div>
                  <div>
                    <span className="font-bold">Total Lost: </span>
                    {currencyFormatter.format(totalLost[r?.id])}
                  </div>
                  <div>
                    <span className="font-bold">Total Open: </span>
                    {currencyFormatter.format(totalOpen[r?.id])}
                  </div>
                  <div className="inline-flex mt-6" role="group">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/race/view/${r.id}`, "forward", "replace")
                      }
                      className="text-white inline-flex items-center bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-sm text-sm px-5 py-2.5 text-center mr-2 mb-2"
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
                      className="text-white bg-gradient-to-r inline-flex items-center from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-sm text-sm px-5 py-2.5 text-center mr-2 mb-2"
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
              </IonCard>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ViewRaces;
