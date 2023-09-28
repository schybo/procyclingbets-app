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
// import ConfirmationPage from "./pages/Confirmation";
import { App } from '@capacitor/app';
// import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

setupIonicReact();

const PcbApp = () => {
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
    App.addListener("appUrlOpen", async (data) => {
      console.log('opened app url');
      console.log(data);
      console.log('that happened');
    
      const url = new URL(data.url);
      const hashParams = new URLSearchParams(url.hash.substring(1)); // Remove the '#' at the start of the hash
    
      const access_token = hashParams.get('access_token');
      const refresh_token = hashParams.get('refresh_token');
      const expires_in = hashParams.get('expires_in');
      const token_type = hashParams.get('token_type');
    
      if (access_token && refresh_token && expires_in && token_type) {
        // Set the session
        const { data: session, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
          expires_in,
          token_type
        });
    
        if (error) {
          console.error('Error during setting session:', error);
        } else {
          console.log('Session:', session);
          // Fetch and store the user data
          const user = session.user;
          // await SecureStoragePlugin.set({ key: 'user', value: JSON.stringify(user) });
          setSession(session);
        }
      }
    });
  }, []);

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
      <div role="status" className="h-screen flex items-center justify-center">
        <img
          className="block animate-pulse transition-opacity ease-in fade-out"
          src="assets/logos/cyclingLogoClear2.png"
          alt="Pro Cycling Bets Logo"
        ></img>
        <span className="sr-only">Loading...</span>
      </div>
    );
  } else if (!session && window.location.pathname != '/auth') {
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
              {/* <Route path="/auth">
                <ConfirmationPage />
              </Route> */}
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

export default PcbApp;
