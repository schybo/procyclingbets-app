import React from "react";
import { useEffect, useState, useRef } from "react";
import { IonText } from "@ionic/react";
import { supabase } from "../supabaseClient";
import { IonNav, useIonLoading, useIonToast } from "@ionic/react";
import { IonContent, IonHeader, IonTitle, IonToolbar } from "@ionic/react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import {
  capitalizeFirstLetter,
  calculateWinnings,
  currencyFormatter,
  BET_STATUS,
} from "../helpers/helpers";
import { CurrencyDollarIcon } from "@heroicons/react/20/solid";

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardPage = () => {
  // const [showLoading, hideLoading] = useIonLoading();
  const [loading, setLoading] = useState(true);
  const [showToast] = useIonToast();
  const [session] = useState(() => supabase.auth.getSession());
  const [eachWayBets, setEachWayBets] = useState([]);
  const [total, setTotal] = useState();
  const [totalWon, setTotalWon] = useState(0);
  const [totalLost, setTotalLost] = useState(0);
  const [totalOpen, setTotalOpen] = useState(0);
  const [perfData, setPerfData] = useState()
  const [isLoading, setIsLoading] = useState(true)

  const labels = ['Won', 'Lost', 'Open']
  const bgColors = [
    '#36d399',
    '#f87272',
    '#E6E6E6'
  ]
  const borderColors = [
    '#28b983',
    '#f53e3e',
    '#c3c3c3',
  ]

  const options = {
    radius: '85%',
    responsive: true,
  };

  useEffect(() => {
    getBets();
  }, [session]);

  useEffect(() => {
    // Assuming this comes after races
    let result = calculateWinnings(eachWayBets);
    console.log("WINNINGS");
    console.log(result);

    // Test using current data
    let calcTotalWon = 0;
    let calcTotalLost = 0;
    let calcTotalOpen = 0;
    let calcTotal = 0;
    for (const [key, value] of Object.entries(result["won"])) {
      calcTotalWon += result["won"][key];
      calcTotalLost += result["lost"][key];
      calcTotalOpen += result["open"][key];
      calcTotal += result["total"][key];
    }
    setTotal(calcTotal);
    setTotalOpen(calcTotalOpen);
    setTotalWon(calcTotalWon);
    setTotalLost(calcTotalLost);
    setPerfData({
      labels: labels,
      datasets: [
        {
          label: 'Race Dataset',
          data: [calcTotalWon, calcTotalLost, calcTotalOpen],
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 1
        }
      ]
    })
    console.log(perfData)
    setIsLoading(false)
  }, [eachWayBets]);

  const getBets = async () => {
    // await showLoading();
    try {
      await getEachWayBets();
    } catch (error) {
      showToast({ message: error.message, duration: 5000 });
    } finally {
      console.log("Hide loading");
      setLoading(false);
      // await hideLoading();
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

  let isAWin = (status) =>
    status === BET_STATUS["placed"] || status === BET_STATUS["won"];
  let wins = eachWayBets.reduce(
    (acc, cv) => (isAWin(cv.status) ? acc + 1 : acc),
    0
  );
  console.log("Length");
  console.log(eachWayBets.length);
  let winPercentage =
    wins > 0
      ? Math.round((100 - (1 - wins / eachWayBets.length) * 100) * 100) / 100
      : 0;

  return (
    <>
      <IonHeader className="flex flex-row items-center justify-center h-[57px]">
        <img className="h-8 ml-6 mr-2" src="assets/icon/iconClear.png"></img>
        <IonToolbar className="inline-block">
          <IonTitle className="mx-0 px-0 h-8">Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="pt-8 pb-4">
          <div className="mb-32 w-full flex flex-row flex-wrap items-center justify-center">
            <img src="assets/svgs/cycling-colored.svg" className="h-16 mb-4"></img>
            <div className="w-full text-xl font-bold block text-center mb-8">
              Betting Performance
            </div>
            {loading ? (
              <div role="status">
                <svg
                  aria-hidden="true"
                  class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
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
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              <div className="flex items-center flex-col flex-wrap justify-center">
                <div className="block">
                  { !isLoading && <Doughnut data={perfData} options={options} redraw={true}/> }
                </div>
                <IonText className="grid grid-cols-3 gap-x-4 gap-y-2 mt-4 w-[90%]">
                  <div className="flex items-start flex-col">
                    <div className="text-md mb-1 text-slate-500">
                      Net
                    </div>
                    <div className={`text-xl font-bold ${
                        totalWon - totalLost > 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {currencyFormatter.format(totalWon - totalLost)}
                    </div>
                  </div>
                  <div className="flex items-start flex-col">
                    <div className="text-md mb-1 text-slate-500">
                      Total
                    </div>
                    <div className="text-xl font-bold text-slate-700">
                      {currencyFormatter.format(total)}
                    </div>
                  </div>
                  <div className="flex items-start flex-col">
                    <div className="text-md mb-1 text-slate-500">
                      Won
                    </div>
                    <div className="text-xl font-bold text-slate-700">
                      {currencyFormatter.format(totalWon)}
                    </div>
                  </div>
                  <div className="flex items-start flex-col">
                    <div className="text-md mb-1 text-slate-500">
                      Lost
                    </div>
                    <div className="text-xl font-bold text-slate-700">
                      {currencyFormatter.format(totalLost)}
                    </div>
                  </div>
                  <div className="flex items-start flex-col">
                    <div className="text-md mb-1 text-slate-500">
                      Open
                    </div>
                    <div className="text-xl font-bold text-slate-700">
                      {currencyFormatter.format(totalOpen)}
                    </div>
                  </div>
                  <div className="flex items-start flex-col">
                    <div className="text-md mb-1 text-slate-500">
                      Wins
                    </div>
                    <div className="text-xl font-bold text-slate-700">
                      {wins}
                    </div>
                  </div>
                  <div className="flex items-start flex-col">
                    <div className="text-md mb-1 text-slate-500">
                      Win Percentage
                    </div>
                    <div className="text-xl font-bold text-slate-700">
                      {winPercentage}
                    </div>
                  </div>
                </IonText>
              </div>
            )}
          </div>  
        </div>
      </IonContent>
    </>
  );
};

export default DashboardPage;
