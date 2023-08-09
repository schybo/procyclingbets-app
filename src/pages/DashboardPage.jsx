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
  const [showLoading, hideLoading] = useIonLoading();
  const [showToast] = useIonToast();
  const [session] = useState(() => supabase.auth.session());
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
    await showLoading();
    try {
      await getEachWayBets();
    } catch (error) {
      showToast({ message: error.message, duration: 5000 });
    } finally {
      console.log("Hide loading");
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
        </div>
      </IonContent>
    </>
  );
};

export default DashboardPage;
