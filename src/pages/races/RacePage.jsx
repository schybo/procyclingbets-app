import {
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonText,
  IonSelect,
  IonSelectOption,
  useIonRouter,
} from "@ionic/react";
import { IonNav, useIonLoading, useIonToast } from "@ionic/react";
import {
  IonCard,
} from "@ionic/react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import {
  capitalizeFirstLetter,
  currencyFormatter,
  BET_STATUS,
  calculateWinnings,
  kebabCase,
  BET_TYPE,
  countEachWay,
} from "../../helpers/helpers";
import { IonFab, IonFabButton, IonFabList, IonIcon } from "@ionic/react";
import { add } from "ionicons/icons";
import { TrashIcon } from "@heroicons/react/20/solid";

const Race = ({ match }) => {
  console.log("MATCH");
  console.log(match.params);

  ChartJS.register(ArcElement, Tooltip, Legend);

  const router = useIonRouter();
  const [showLoading, hideLoading] = useIonLoading();
  const [showToast] = useIonToast();
  const [session] = useState(() => supabase.auth.getSession());
  const [race, setRace] = useState();
  const [betStatus, setStatus] = useState([]);
  const [total, setTotal] = useState();
  const [totalWon, setTotalWon] = useState();
  const [totalLost, setTotalLost] = useState();
  const [totalOpen, setTotalOpen] = useState();
  const [ridersInfo, setRidersInfo] = useState();
  const [betTypes, setTypes] = useState([]);
  const [eachWayBets, setEachWayBets] = useState([]);
  const [viewState, setViewState] = useState('all');

  useEffect(() => {
    getRaceAndBets();
    return () => {};
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
      await getEachWayTypeOptions();
      console.log("BET TYPES");
      console.log(betTypes);
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

  const getEachWayTypeOptions = async () => {
    console.log("Getting RACE");

    let { data, error, status } = await supabase.from("eachWayType").select();

    if (error && status !== 406) {
      throw error;
    }

    if (data) {
      console.log("Types");
      console.log(data);
      let betType = {};
      data.map((d) => {
        betType[d.id] = d.type;
      });
      setTypes(betType);
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

  const getEachWayBets = async () => {
    console.log("Getting Bets for races");
    const {
      data: { user },
    } = await supabase.auth.getUser();
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
      // console.log(data);
      data.map((r) => {
        // riderDict[r.rider_key] = r;
        riderDict[kebabCase(r.name)] = r;
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

  function valueOrDefault(value, defaultValue) {
    return typeof value === 'undefined' ? defaultValue : value;
  }

  var _seed = Date.now();

  function srand(seed) {
    _seed = seed;
  }

  function rand(min, max) {
    min = valueOrDefault(min, 0);
    max = valueOrDefault(max, 0);
    _seed = (_seed * 9301 + 49297) % 233280;
    return min + (_seed / 233280) * (max - min);
  }

  const CHART_COLORS = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
  };

  function numbers(config) {
    var cfg = config || {};
    var min = valueOrDefault(cfg.min, 0);
    var max = valueOrDefault(cfg.max, 100);
    var from = valueOrDefault(cfg.from, []);
    var count = valueOrDefault(cfg.count, 8);
    var decimals = valueOrDefault(cfg.decimals, 8);
    var continuity = valueOrDefault(cfg.continuity, 1);
    var dfactor = Math.pow(10, decimals) || 0;
    var data = [];
    var i, value;
  
    for (i = 0; i < count; ++i) {
      value = (from[i] || 0) + rand(min, max);
      if (rand() <= continuity) {
        data.push(Math.round(dfactor * value) / dfactor);
      } else {
        data.push(null);
      }
    }
  
    return data;
  }

  const DATA_COUNT = 5;
  const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 100};

  const data = {
    labels: ['Red', 'Orange', 'Yellow', 'Green', 'Blue'],
    datasets: [
      {
        label: 'Dataset 1',
        data: numbers(NUMBER_CFG),
        backgroundColor: Object.values(CHART_COLORS),
      }
    ]
  };

  return (
    <>
      <IonHeader className="flex flex-row items-center justify-center">
        <img className="h-8 ml-6 mr-2" src="assets/icon/iconClear.png"></img>
        <IonToolbar className="inline-block">
          <IonTitle className="mx-0 px-0 h-8">{race?.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="pt-8 pb-16">
          <div className="flex items-center flex-col flex-wrap justify-center mb-8 text-center">
            <div className="block">
              <Doughnut data={data} />
            </div>
            <IonText className="block">
              <h1 className="text-xl font-bold mb-2">
                Net: {currencyFormatter.format(totalWon - total)}
              </h1>
              <h2 className="text-lg mb-2">
                Total Bet: {currencyFormatter.format(total)}
              </h2>
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
            <div className="block mt-6 w-[90%] text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
              <ul className="flex flex-wrap -mb-px items-center w-full block justify-center">
                <li className="inline-block mr-2">
                  <button
                    onClick={() => setViewState('all')}
                    className={`inline-block p-4 border-b-2 border-solid rounded-t-lg ${viewState == 'all' ? 'active text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
                  >
                    All
                  </button>
                </li>
                <li className="inline-block mr-2">
                  <button
                    onClick={() => setViewState('open')}
                    className={`inline-block p-4 border-b-2 border-solid rounded-t-lg ${viewState == 'open' ? 'active text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
                  >
                    Open
                  </button>
                </li>
              </ul>
            </div>
            <div className="w-full flex flex-row flex-wrap items-center justify-center mt-6">
              {eachWayBets.map((ew) => {
                if (viewState == "open" && ew.status != 'open') {
                  return
                }

                console.log("Rider name");
                console.log(kebabCase(ew?.rider_name));
                let image = `https://www.procyclingstats.com/${
                  ridersInfo[kebabCase(ew?.rider_name)]?.image_url
                }`;
                return (
                  <IonCard
                    color="light"
                    key={`bet-${ew?.id}`}
                    className="w-full md:w-64 px-4 mx-6 h-60 flex flex-row items-center justify-around bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    {/* TODO: Placeholder */}
                    {ew?.type != BET_TYPE["matchup"] ? (
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
                    ) : (
                      <img
                        className="w-12 mx-4 rounded-t-lg h-auto md:rounded-none md:rounded-l-lg"
                        src="assets/svgs/swords2.svg"
                        alt=""
                      ></img>
                    )}
                    <div className="w-40 flex flex-col items-start justify-between p-4 leading-normal">
                      <div className="text-lg font-bold overflow-hidden truncate">
                        {ew?.type == BET_TYPE["matchup"]
                          ? "Matchup"
                          : ew?.rider_name}
                      </div>
                      <div>
                        <span className="font-bold">Type: </span>
                        {ew?.type && betTypes
                          ? capitalizeFirstLetter(betTypes[ew?.type])
                          : "Not set"}
                      </div>
                      {ew?.custom_type && (<div>
                        <span className="font-bold">Custom Type: {ew?.custom_type}</span>
                      </div>)}
                      <div>
                        <span className="font-bold">Odds: </span>
                        {ew?.rider_odds && ew?.type != BET_TYPE["matchup"]
                          ? ew.rider_odds.toFixed(2)
                          : ew?.rider_odds}
                      </div>

                      <div>
                        <span className="font-bold">Stake: </span>
                        {`${currencyFormatter.format(
                          ew?.amount * (countEachWay(ew) ? 2 : 1)
                        )}`}
                      </div>
                      <div className="flex flex-row justify-start items-center mt-2">
                        <label className="mb-2 mr-4 font-bold">Status:</label>
                        <IonSelect
                          className="bg-gray-50 border border-gray-300 min-h-0 p-1 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 py-0.5 px-2 mb-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
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
                        className="mt-4 text-gray-600 border-solid w-24 flex flex-row items-center justify-start border border-grey-100 rounded-md focus:ring-4 focus:outline-none focus:ring-red-300 font-medium py-1 text-center mr-2 mb-2 mt-2"
                      >
                        <TrashIcon className="h-4 mr-2 ml-2 text-gray-600"></TrashIcon>
                        Delete
                      </button>
                    </div>
                  </IonCard>
                );
              })}
            </div>
          </div>
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
