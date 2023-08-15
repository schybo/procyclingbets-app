import React from "react";
import { useEffect, useState } from "react";
import { IonText } from "@ionic/react";
import { supabase } from "../supabaseClient";
import { IonNav, useIonLoading, useIonToast } from "@ionic/react";
import { IonContent, IonHeader, IonTitle, IonToolbar } from "@ionic/react";
import {
  capitalizeFirstLetter,
  calculateWinnings,
  currencyFormatter,
  BET_STATUS,
} from "../helpers/helpers";

const DashboardPage = () => {
  // const [showLoading, hideLoading] = useIonLoading();
  const [loading, setLoading] = useState(true);
  const [showToast] = useIonToast();
  const [session] = useState(() => supabase.auth.getSession());
  const [eachWayBets, setEachWayBets] = useState([]);
  const [total, setTotal] = useState();
  const [totalWon, setTotalWon] = useState();
  const [totalLost, setTotalLost] = useState();
  const [totalOpen, setTotalOpen] = useState();

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
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="mt-20 mb-32 w-full flex flex-row flex-wrap items-center justify-center">
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
            <div className="text-md block text-center w-full">
              <div className="mb-4">
                Net: {currencyFormatter.format(totalWon - total)}
              </div>
              <div className="mb-4">
                Total Bet: {currencyFormatter.format(total)}
              </div>
              <div className="mb-4">
                Total Won: {currencyFormatter.format(totalWon)}
              </div>
              <div className="mb-4">
                Total Lost: {currencyFormatter.format(totalLost)}
              </div>
              <div className="mb-4">
                Total Open: {currencyFormatter.format(totalOpen)}
              </div>
              <div className="mb-4">Wins: {wins}</div>
              <div className="mb-4">Win Percentage: {winPercentage}%</div>
            </div>
          )}
        </div>
      </IonContent>
    </>
  );
};

export default DashboardPage;
