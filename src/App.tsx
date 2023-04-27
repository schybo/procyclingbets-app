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
import { supabase } from "./supabaseClient";

import "@ionic/react/css/ionic.bundle.css";

/* Theme variables */
import "./theme/variables.css";
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

import HomePage2 from "./pages/HomePage2";
import RadioPage from "./pages/RadioPage";
import LibraryPage from "./pages/LibraryPage";
import SearchPage from "./pages/SearchPage";

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
                return session ? <Redirect to="/home" /> : <LoginPage />;
              }}
            />
            <Route path="/home" render={() => <HomePage2 />} exact={true} />
            <Route path="/radio" render={() => <RadioPage />} exact={true} />
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
            <IonTabButton tab="home" href="/home">
              <IonIcon icon={playCircle} />
              <IonLabel>Races</IonLabel>
            </IonTabButton>

            <IonTabButton tab="radio" href="/radio">
              <IonIcon icon={radio} />
              <IonLabel>Radio</IonLabel>
            </IonTabButton>

            <IonTabButton tab="library" href="/library">
              <IonIcon icon={library} />
              <IonLabel>Library</IonLabel>
            </IonTabButton>

            <IonTabButton tab="search" href="/search">
              <IonIcon icon={search} />
              <IonLabel>Search</IonLabel>
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
};

export default App;
