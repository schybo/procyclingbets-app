import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from "@ionic/react";
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonFabList,
  IonHeader,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "./supabaseClient";

import "@ionic/react/css/ionic.bundle.css";

/* Theme variables */
import "./theme/variables.css";
import "./theme/tailwind.css";
import "./theme/app.css";
import { Login } from "./pages/Login";
import { AccountPage } from "./pages/Account";
import { useEffect, useState } from "react";

import {
  playCircle,
  radio,
  library,
  search,
  personCircleOutline,
} from "ionicons/icons";

import Races from "./pages/Races";
import DashboardPage from "./pages/DashboardPage.jsx";
import ViewRaces from "./pages/races/ViewRacesPage";
import CreateRace from "./pages/races/CreateRacePage";
import Race from "./pages/races/RacePage";
import EachWay from "./pages/races/EachWayPage";

setupIonicReact();

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState(null);

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
    return <div></div>;
  } else if (!session) {
    return <Login></Login>;
  } else {
    return (
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
    );
  }
};

export default App;
