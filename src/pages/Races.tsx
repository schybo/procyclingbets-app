import { IonContent, IonHeader, IonTitle, IonToolbar } from "@ionic/react";
import {
  IonNav,
  useIonLoading,
  useIonToast,
  IonList,
  IonItem,
  IonButton,
} from "@ionic/react";

const Races = () => {
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Races</IonTitle>
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
          <IonList>
            <IonItem routerLink="/race/view" routerDirection="forward">
              <button
                type="button"
                className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
              >
                View Races
              </button>
            </IonItem>
            <IonItem routerLink="/race/create" routerDirection="forward">
              <button
                type="button"
                className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
              >
                Create Race
              </button>
            </IonItem>
          </IonList>
          ;
          {/* <IonSegment value="default">
            <IonSegmentButton value="default">
              <IonLabel>Default</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="segment">
              <IonLabel>Segment</IonLabel>
            </IonSegmentButton>
          </IonSegment> */}
        </div>
      </IonContent>
    </>
  );
};

export default Races;
