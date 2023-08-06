export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",

  // These options are needed to round to whole numbers if that's what you want.
  //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
  //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

export const BET_STATUS = {
  void: 1,
  placed: 2,
  won: 3,
  lost: 4,
};

export const round = (value, decimals) => {
  return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
};

// export const fixBrokenOdds = (bet) => {
//   if (bet.type === BET_TYPE['matchup']) {
//     return (bet.matchup_return / )
//   }
// }

export const BET_TYPE = {
  overall: 1,
  stage: 2,
  kom: 3,
  points: 4,
  matchup: 5,
};

export const kebabCase = (string) =>
  string
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();

export const calculateWinnings = (bets) => {
  let tw = {};
  let to = {};
  let tl = {};
  let t = {};

  // Set default object
  bets.map((bet) => {
    t[bet.race_id] = 0;
    tw[bet.race_id] = 0;
    to[bet.race_id] = 0;
    tl[bet.race_id] = 0;
  });

  bets.map((bet) => {
    t[bet.race_id] += bet.amount;
    if (bet.type !== BET_TYPE["matchup"] && bet.each_way) {
      t[bet.race_id] += bet.amount;
    }

    if (bet.status === BET_STATUS["won"]) {
      if (bet.type !== BET_TYPE["matchup"]) {
        tw[bet.race_id] += bet.amount * bet.rider_odds;
        if (bet.each_way) {
          tw[bet.race_id] +=
            bet.amount * (bet.rider_odds * bet.each_way_return);
        }
      }
    } else if (bet.status === BET_STATUS["lost"]) {
      tl[bet.race_id] += bet.amount * (bet.type.each_way ? 2 : 1);
    } else if (bet.status === BET_STATUS["placed"]) {
      // Assuming this is an each way bet
      tl[bet.race_id] += bet.amount;
      tw[bet.race_id] += bet.amount * (bet.rider_odds * bet.each_way_return);
    } else if (bet.status === BET_STATUS["void"]) {
      tw[bet.race_id] += bet.amount;
      if (bet.type.each_way) {
        tw[bet.race_id] += bet.amount;
      }
    } else {
      // Open
      console.log("REACHED HERE");
      console.log(bet);
      to[bet.race_id] += bet.amount;
      if (bet.type !== BET_TYPE["matchup"] && bet.each_way) {
        to[bet.race_id] += bet.amount;
      }
    }
  });

  for (const [key, value] of Object.entries(to)) {
    to[key] = round(to[key], 2);
    tw[key] = round(tw[key], 2);
    t[key] = round(t[key], 2);
    tl[key] = round(tl[key], 2);
  }

  return {
    won: tw,
    lost: tl,
    open: to,
    total: t,
  };
};
