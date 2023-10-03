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
import {
  IonNav,
  useIonLoading,
  useIonToast,
  IonButtons,
  IonBackButton,
} from "@ionic/react";
import { caretBack } from "ionicons/icons";
import { IonCard } from "@ionic/react";
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
  CHART_COLORS,
  numbers,
  rand,
  valueOrDefault,
  srand,
} from "../../helpers/helpers";
import { IonFab, IonFabButton, IonFabList, IonIcon } from "@ionic/react";
import { add } from "ionicons/icons";
import { TrashIcon } from "@heroicons/react/20/solid";

ChartJS.register(ArcElement, Tooltip, Legend);

const Race = ({ match }) => {
  console.log("MATCH");
  console.log(match.params);

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
  const [viewState, setViewState] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const labels = ["Won", "Lost", "Open"];
  const bgColors = ["#36d399", "#f87272", "#E6E6E6"];
  const borderColors = ["#28b983", "#f53e3e", "#c3c3c3"];

  const options = {
    radius: "85%",
    responsive: true,
  };

  // TODO Colors
  const [perfData, setPerfData] = useState({
    labels: labels,
    datasets: [
      {
        label: "Race Dataset",
        data: [0, 0, 0],
        backgroundColor: bgColors,
        // backgroundColor: Object.values(CHART_COLORS),
      },
    ],
  });

  useEffect(() => {
    getRaceAndBets();
    return () => {};
  }, [session]);

  // When each way bets changes we need to recalculate totals and graph
  useEffect(() => {
    let result = calculateWinnings(eachWayBets);
    setTotal(result["total"][match.params.id] || 0);
    setTotalOpen(result["open"][match.params.id] || 0);
    setTotalWon(result["won"][match.params.id] || 0);
    setTotalLost(result["lost"][match.params.id] || 0);
    setPerfData({
      labels: labels,
      datasets: [
        {
          label: "Race Dataset",
          data: [
            result["won"][match.params.id],
            result["lost"][match.params.id],
            result["open"][match.params.id],
          ],
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    });
    setIsLoading(false);
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
      // console.log(data);
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
      // console.log(data);
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
      setEachWayBets(data);
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
      setStatus(data);
    }
  };

  const setBetStatus = async (bet, s) => {
    await showLoading();
    try {
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

      // Refresh the list of bets
      await getEachWayBets();
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
      <IonHeader className="h-[57px]">
        <IonToolbar className="inline-block">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/race"></IonBackButton>
          </IonButtons>
          <div className="flex flex-row items-center justify-center">
            <img
              className="h-8 ml-1 mr-2"
              src="assets/icon/iconClear.png"
            ></img>
            <IonTitle className="mx-0 px-0 h-8">{race?.name}</IonTitle>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="pt-8 pb-16">
          <div className="flex items-center flex-col flex-wrap justify-center mb-8 text-center">
            <div className="block">
              {!isLoading && (
                <Doughnut data={perfData} options={options} redraw={true} />
              )}
              {isLoading && (
                <div role="status" className="flex items-center justify center w-[300px] h-[300px]">
                  <svg
                    aria-hidden="true"
                    class="inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-green-500"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span class="sr-only">Loading...</span>
                </div>
              )}
            </div>
            <IonText className="grid grid-cols-3 gap-x-16 gap-y-2 mt-4">
              <div className="flex items-start flex-col">
                <div className="text-md mb-1 text-slate-500">Net</div>
                <div
                  className={`text-xl font-bold ${
                    totalWon - totalLost > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {currencyFormatter.format(totalWon - totalLost)}
                </div>
              </div>
              <div className="flex items-start flex-col">
                <div className="text-md mb-1 text-slate-500">Total</div>
                <div className="text-xl font-bold text-slate-700">
                  {currencyFormatter.format(total)}
                </div>
              </div>
              <div className="flex items-start flex-col">
                <div className="text-md mb-1 text-slate-500">Won</div>
                <div className="text-xl font-bold text-slate-700">
                  {currencyFormatter.format(totalWon)}
                </div>
              </div>
              <div className="flex items-start flex-col">
                <div className="text-md mb-1 text-slate-500">Lost</div>
                <div className="text-xl font-bold text-slate-700">
                  {currencyFormatter.format(totalLost)}
                </div>
              </div>
              <div className="flex items-start flex-col">
                <div className="text-md mb-1 text-slate-500">Open</div>
                <div className="text-xl font-bold text-slate-700">
                  {currencyFormatter.format(totalOpen)}
                </div>
              </div>
            </IonText>
            <div className="block mt-6 w-[90%] text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
              <ul className="flex flex-wrap -mb-px items-center w-full block justify-center">
                <li className="inline-block mr-2">
                  <button
                    onClick={() => setViewState("all")}
                    className={`inline-block p-4 border-b-2 border-solid rounded-t-lg ${
                      viewState == "all"
                        ? "active text-blue-600 border-blue-600"
                        : "border-transparent hover:text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    All
                  </button>
                </li>
                <li className="inline-block mr-2">
                  <button
                    onClick={() => setViewState("open")}
                    className={`inline-block p-4 border-b-2 border-solid rounded-t-lg ${
                      viewState == "open"
                        ? "active text-blue-600 border-blue-600"
                        : "border-transparent hover:text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    Open
                  </button>
                </li>
              </ul>
            </div>
            <div className="w-full flex flex-row flex-wrap items-center justify-center mt-6">
              {eachWayBets.map((ew) => {
                if (viewState == "open" && ew.status != "open") {
                  return;
                }

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
                      {ew?.custom_type && (
                        <div>
                          <span className="font-bold">
                            Custom Type: {ew?.custom_type}
                          </span>
                        </div>
                      )}
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
