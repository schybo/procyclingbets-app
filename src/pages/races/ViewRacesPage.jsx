import React from "react";
import {
  IonCard,
  IonText,
  useIonRouter,
} from "@ionic/react";
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
import LoadingCard from "../../components/LoadingCard";
import Dropdown from "../../components/Dropdown";
import { EyeIcon, FlagIcon } from "@heroicons/react/20/solid";

const ViewRaces = ({viewState}) => {
  const [showLoading, hideLoading] = useIonLoading();
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
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

  const archiveToggle = async (race) => {
    await showLoading();
    try {
      let { error, status } = await supabase
        .from("races")
        .update({ archived: !race.archived })
        .eq("id", race.id);

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
      <div className="w-full flex flex-row flex-wrap items-center justify-center">
        {loading ? (
          <LoadingCard></LoadingCard>
        ) : (
          <>
            {races.map((r) => {
              if (viewState == "archived" && !r.archived || viewState == "active" && r.archived) {
                return
              }

              let net = totalWon[r?.id] - total[r?.id];
              return (
                <IonCard
                  color="light"
                  key={`race-${r?.id}`}
                  className="w-full md:w-64 h-64 mx-6 flex flex-row items-center text-ellipsis bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl">
                  <div className="flex flex-col justify-between px-4 leading-normal w-full">
                    <div className="header flex justify-between px-4">
                      <div className="text-lg font-bold truncate">
                        <a href={`/race/view/${r.id}`}>
                          <div className="flex flex-row items-center mb-2">
                            <img src="assets/svgs/cycling-colored.svg" className="h-7 mr-2"></img>
                            <h5 className="text-2xl font-bold truncate tracking-tight text-gray-900 dark:text-white">
                              {r?.name}
                            </h5>
                          </div>
                        </a>
                      </div>
                      <div className="ml-2">
                        <Dropdown race={r} deleteRace={deleteRace} archiveToggle={archiveToggle}></Dropdown>
                      </div>
                    </div>
                    <IonText className="grid grid-cols-3 gap-x-8 gap-y-1 mt-1 px-4">
                      <div className="flex items-start flex-col">
                        <div className="text-md mb-0.5 text-slate-500">
                          Net
                        </div>
                        <div className={`text-xl font-bold ${
                          net > 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {currencyFormatter.format(net)}
                        </div>
                      </div>
                      <div className="flex items-start flex-col">
                        <div className="text-md mb-0.5 text-slate-500">
                          Total
                        </div>
                        <div className="text-xl font-bold text-slate-700">
                          {currencyFormatter.format(total[r?.id])}
                        </div>
                      </div>
                      <div className="flex items-start flex-col">
                        <div className="text-md mb-0.5 text-slate-500">
                          Won
                        </div>
                        <div className="text-xl font-bold text-slate-700">
                          {currencyFormatter.format(totalWon[r?.id])}
                        </div>
                      </div>
                      <div className="flex items-start flex-col">
                        <div className="text-md mb-0.5 text-slate-500">
                          Lost
                        </div>
                        <div className="text-xl font-bold text-slate-700">
                          {currencyFormatter.format(totalLost[r?.id])}
                        </div>
                      </div>
                      <div className="flex items-start flex-col">
                        <div className="text-md mb-0.5 text-slate-500">
                          Open
                        </div>
                        <div className="text-xl font-bold text-slate-700">
                          {currencyFormatter.format(totalOpen[r?.id])}
                        </div>
                      </div>
                    </IonText>
                    <hr className="mt-4"></hr>
                    <button
                      onClick={() =>
                        router.push(
                          `/race/view/${r.id}`,
                          "forward",
                          "replace"
                        )
                      }
                      type="button"
                      className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 pt-4 pb-2.5"
                    >
                      View Details
                    </button>
                  </div>
                </IonCard>
              );
            })}
          </>
        )}
      </div>
    </>
  );
};

export default ViewRaces;
