import { IonContent, IonHeader, IonTitle, IonToolbar } from "@ionic/react";
import {
  IonNav,
  useIonLoading,
  useIonToast,
  IonList,
  IonItem,
  IonButton,
} from "@ionic/react";
import { IonFab, IonFabButton, IonFabList, IonIcon } from "@ionic/react";
import {
  chevronDownCircle,
  chevronForwardCircle,
  chevronUpCircle,
  colorPalette,
  document,
  globe,
  add,
} from "ionicons/icons";
import ViewRaces from "./races/ViewRacesPage";

const Races = () => {
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Races</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="w-full map-bg pt-8 pb-20 h-fit">
          <ViewRaces></ViewRaces>
        </div>
        <IonFab
          className="mb-16"
          slot="fixed"
          vertical="bottom"
          horizontal="end"
        >
          <IonFabButton routerLink="/race/create" routerDirection="forward">
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
          {/* <IonFabList side="top">
            <IonFabButton>
              <IonIcon icon={document}></IonIcon>
            </IonFabButton>
            <IonFabButton>
              <IonIcon icon={colorPalette}></IonIcon>
            </IonFabButton>
            <IonFabButton>
              <IonIcon icon={globe}></IonIcon>
            </IonFabButton>
          </IonFabList> */}
        </IonFab>
      </IonContent>
    </>
  );
};

export default Races;
