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
          <div className="text-center left-0 right-0 top-1/2 transform -translate-y-1/2 flex justify-center items-center">
            <div className="border border-gray-100 rounded-xl shadow-2xl p-8 bg-gradient-to-r from-green-400 via-blue-900 to-blue-400 text-white max-w-lg">
              <h1 className="text-2xl font-bold">
                Using TailwindCSS in Ionic with React
              </h1>
              <p className="mt-4">
                This is an example of how you can use{" "}
                <span className="font-bold">TailwindCSS</span> in an{" "}
                <span className="font-bold">Ionic</span> application using{" "}
                <span className="font-bold">React</span> framework.
              </p>
            </div>
          </div>
          <IonList>
            <IonItem routerLink="/race/view" routerDirection="forward">
              <IonButton>View Races</IonButton>
            </IonItem>
            <IonItem routerLink="/race/create" routerDirection="forward">
              <IonButton>Create Race</IonButton>
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
