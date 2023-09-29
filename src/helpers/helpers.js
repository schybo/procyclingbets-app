import deburr from "lodash.deburr";

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
  open: 5,
};

export const round = (value, decimals) => {
  return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
};

// export const fixBrokenOdds = (bet) => {
//   if (bet.type === BET_TYPE['matchup']) {
//     return (bet.matchup_return / )
//   }
// }

export function valueOrDefault(value, defaultValue) {
  return typeof value === 'undefined' ? defaultValue : value;
}

let _seed = Date.now();

export function srand(seed) {
  _seed = seed;
}

export function rand(min, max) {
  min = valueOrDefault(min, 0);
  max = valueOrDefault(max, 0);
  _seed = (_seed * 9301 + 49297) % 233280;
  return min + (_seed / 233280) * (max - min);
}

export const CHART_COLORS = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
};

export function numbers(config) {
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

export const BET_TYPE = {
  overall: 1,
  stage: 2,
  kom: 3,
  points: 4,
  matchup: 5,
  top3: 6,
  top10: 7,
  custom: 9
};

export const convertToEnglish = (string) => {
  return string.normalize("NFD").replace(/\p{Diacritic}/gu, "");
};

export const kebabCase = (string) => {
  string = deburr(string);
  return string
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .replace(/\W/g, "") // Removes non alpha numeric characters
    .toLowerCase();
};

export const countEachWay = (bet) =>
  bet.type !== BET_TYPE["matchup"] &&
  bet.type !== BET_TYPE["top3"] &&
  bet.type !== BET_TYPE["top10"] &&
  bet.each_way;

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
    if (!bet.synthetic) {
      t[bet.race_id] += bet.amount;
      if (countEachWay(bet)) {
        t[bet.race_id] += bet.amount;
      }

      if (bet.status === BET_STATUS["won"]) {
        // Remember to always add back your base bet
        tw[bet.race_id] += bet.amount;
        tw[bet.race_id] += bet.amount * bet.rider_odds;

        // TODO: Have this in place because each_way defaults true
        if (countEachWay(bet)) {
          tw[bet.race_id] += bet.amount;
          tw[bet.race_id] +=
            bet.amount * (bet.rider_odds * bet.each_way_return);
        }
      } else if (bet.status === BET_STATUS["lost"]) {
        // Add amount bet...and the each way amount?
        tl[bet.race_id] += bet.amount;
        if (countEachWay(bet)) {
          tl[bet.race_id] += bet.amount;
        }
      } else if (bet.status === BET_STATUS["placed"]) {
        // Assuming this is an each way bet because o/w placed should be an option
        // TODO: Don't allow placed as option for non-eachway
        tl[bet.race_id] += bet.amount;
        // Remember to always add the base amount you bet
        tw[bet.race_id] += bet.amount * (bet.rider_odds * bet.each_way_return);
      } else if (bet.status === BET_STATUS["void"]) {
        // Return back base bet + EW if applicable to total won
        tw[bet.race_id] += bet.amount;
        if (countEachWay(bet)) {
          tw[bet.race_id] += bet.amount;
        }
      } else {
        // Open
        // Return back base bet + EW if applicable
        to[bet.race_id] += bet.amount;
        if (countEachWay(bet)) {
          to[bet.race_id] += bet.amount;
        }
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
