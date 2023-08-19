import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "./supabaseClient";
import { useIonLoading, useIonRouter } from "@ionic/react";

import "@ionic/react/css/ionic.bundle.css";
// import "@radix-ui/themes/styles.css";

/* Theme variables */
import "./theme/variables.css";
import "./theme/tailwind.css";
import "./theme/app.css";
// import { Theme } from "@radix-ui/themes";
import { Login } from "./pages/Login";
import { AccountPage } from "./pages/Account";
import { useEffect, useState } from "react";

import {
  personCircleOutline,
} from "ionicons/icons";

import Races from "./pages/Races";
import DashboardPage from "./pages/DashboardPage.jsx";
import ViewRaces from "./pages/races/ViewRacesPage";
import CreateRace from "./pages/races/CreateRacePage";
import Race from "./pages/races/RacePage";
import EachWay from "./pages/races/EachWayPage";
import ConfirmationPage from "./pages/Confirmation";

setupIonicReact();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);
  // const [text, setText] = useState('Hi There');

  const [access, setAccess] = useState();
  const [refresh, setRefresh] = useState();
  const router = useIonRouter();

  // useEffect(() => {
  //     // showLoading()
  //     const hash = window.location.hash;
  //     setText(hash)
  //     const parts = hash.replace('#', '').split('&');
  //     for (const item of parts) {
  //         let [key, value] = item.split('=');
  //         if (key === 'access_token') setAccess(value);
  //         if (key === 'refresh_token') setRefresh(value);
  //     }
  // }, []);

  // useEffect(() => {
  //     if (!access || !refresh) return;
  //     const setSessionfunc = async (access_token, refresh_token) => {
  //         await supabase.auth.setSession({ access_token, refresh_token });
  //         router.push('/');
  //     };
  //     setSessionfunc(access, refresh);
  // }, [access, refresh]);

  useEffect(() => {
    setIsLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    console.log("LOADING");
    return (
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
    );
  } else if (!session) {
    return <Login text={'Hello'}></Login>;
  } else {
    return (
      // <Theme>
      <IonApp>
        <IonReactRouter>
          <IonTabs>
            <IonRouterOutlet>
              <Route
                exact
                path="/"
                render={() => {
                  return session ? <Redirect to="/race" /> : <Login />;
                }}
              />
              <Route path="/race" render={() => <Races />} exact={true} />
              <Route
                path="/race/view"
                render={() => <ViewRaces />}
                exact={true}
              />
              <Route
                path="/race/create"
                render={() => <CreateRace />}
                exact={true}
              />
              <Route path="/race/view/:id" component={Race} />
              <Route path="/race/view/:id/addEachWay" component={EachWay} />
              <Route
                path="/dashboard"
                render={() => <DashboardPage />}
                exact={true}
              />
              <Route exact path="/account">
                <AccountPage />
              </Route>
              <Route path="/gizmos">
                <ConfirmationPage />
              </Route>
            </IonRouterOutlet>

            <IonTabBar slot="bottom" className="shadow-topSm">
              <IonTabButton tab="home" href="/race">
                <IonIcon src="assets/svgs/bicycle-man.svg" />
                <IonLabel>Races</IonLabel>
              </IonTabButton>

              <IonTabButton tab="dashboard" href="/dashboard">
                <IonIcon src="assets/svgs/dashboard.svg" />
                <IonLabel>Dashboard</IonLabel>
              </IonTabButton>

              <IonTabButton tab="account" href="/account">
                <IonIcon icon={personCircleOutline} />
                <IonLabel>Account</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </IonReactRouter>
      </IonApp>
      // </Theme>
    );
  }
};

export default App;
