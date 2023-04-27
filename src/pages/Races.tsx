import { IonContent, IonHeader, IonTitle, IonToolbar } from "@ionic/react";
import {
  IonNav,
  useIonLoading,
  useIonToast,
  IonList,
  IonItem,
  IonLabel,
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
            <IonItem routerLink="/race/view">
              <IonLabel>View Races</IonLabel>
            </IonItem>
            <IonItem routerLink="/race/create">
              <IonLabel>Create Race</IonLabel>
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
