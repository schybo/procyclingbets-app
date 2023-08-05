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
import { supabase } from "./supabaseClient";

import "@ionic/react/css/ionic.bundle.css";

/* Theme variables */
import "./theme/variables.css";
import "./theme/tailwind.css";
import { LoginPage } from "./pages/Login";
import { AccountPage } from "./pages/Account";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";

import {
  playCircle,
  radio,
  library,
  search,
  personCircleOutline,
} from "ionicons/icons";

import Races from "./pages/Races";
import DashboardPage from "./pages/DashboardPage.jsx";
import LibraryPage from "./pages/LibraryPage";
import SearchPage from "./pages/SearchPage";
import ViewRaces from "./pages/races/ViewRacesPage";
import CreateRace from "./pages/races/CreateRacePage";
import Race from "./pages/races/RacePage";
import EachWay from "./pages/races/EachWayPage";
import Head2Head from "./pages/races/Head2HeadPage";

setupIonicReact();

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    setSession(supabase.auth.session());
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, [session]);
  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route
              exact
              path="/"
              render={() => {
                return session ? <Redirect to="/race" /> : <LoginPage />;
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
            <Route path="/race/view/:id/addHead2Head" component={Head2Head} />
            <Route
              path="/dashboard"
              render={() => <DashboardPage />}
              exact={true}
            />
            <Route
              path="/library"
              render={() => <LibraryPage />}
              exact={true}
            />
            <Route path="/search" render={() => <SearchPage />} exact={true} />
            <Route exact path="/account">
              <AccountPage />
            </Route>
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/race">
              <IonIcon icon={playCircle} />
              <IonLabel>Races</IonLabel>
            </IonTabButton>

            <IonTabButton tab="dashboard" href="/dashboard">
              <IonIcon icon={radio} />
              <IonLabel>Dashboard</IonLabel>
            </IonTabButton>

            {/* <IonTabButton tab="library" href="/library">
              <IonIcon icon={library} />
              <IonLabel>Library</IonLabel>
            </IonTabButton> */}

            <IonTabButton tab="account" href="/account">
              <IonIcon icon={personCircleOutline} />
              <IonLabel>Account</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
