import React from "react";
import { useEffect, useState } from "react";
import { IonText } from "@ionic/react";
import { supabase } from "../supabaseClient";
import { IonNav, useIonLoading, useIonToast } from "@ionic/react";
import { IonContent, IonHeader, IonTitle, IonToolbar } from "@ionic/react";
import {
  capitalizeFirstLetter,
  currencyFormatter,
  BET_STATUS,
} from "../helpers/helpers";

const DashboardPage = () => {
  const [showLoading, hideLoading] = useIonLoading();
  const [showToast] = useIonToast();
  const [session] = useState(() => supabase.auth.session());
  const [eachWayBets, setEachWayBets] = useState([]);
  const [totalWon, setTotalWon] = useState();
  const [totalLost, setTotalLost] = useState();
  const [totalOpen, setTotalOpen] = useState();

  useEffect(() => {
    getBets();
  }, [session]);

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

    let totalWon = 0;
    let totalLost = 0;
    let totalOpen = 0;
    if (data) {
      console.log("Bets");
      console.log(data);
      setEachWayBets(data);
      data.map((ew) => {
        if (ew.status === BET_STATUS["won"]) {
          totalWon += ew.amount * ew.rider_odds;
        } else if (ew.status === BET_STATUS["lost"]) {
          totalLost += ew.amount;
        } else if (ew.status === BET_STATUS["placed"]) {
          totalWon += ew.amount * (ew.rider_odds * ew.each_way_return);
        } else if (ew.status === BET_STATUS["void"]) {
          totalWon += ew.amount;
        } else {
          totalOpen += ew.amount;
        }
      });
      setTotalOpen(totalOpen);
      setTotalWon(totalWon);
      setTotalLost(totalLost);
    }
  };

  let isAWin = (status) =>
    status === BET_STATUS["placed"] || status === BET_STATUS["won"];
  let total = eachWayBets.reduce((acc, cv) => acc + cv?.amount, 0);
  total = currencyFormatter.format(total);
  let wins = eachWayBets.reduce(
    (acc, cv) => (isAWin(cv.status) ? acc + 1 : acc),
    0
  );
  console.log("Length");
  console.log(eachWayBets.length);
  let winPercentage =
    Math.round((100 - (wins / eachWayBets.length) * 100) * 100) / 100;

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <IonText>
            <h1>Total Bet: {total}</h1>
            <h2>Total Won: {totalWon}</h2>
            <h2>Total Lost: {totalLost}</h2>
            <h2>Total Open: {totalOpen}</h2>
            <h2>Wins: {wins}</h2>
            <h2>Win Percentage: {winPercentage}%</h2>
          </IonText>
        </div>
      </IonContent>
    </>
  );
};

export default DashboardPage;
