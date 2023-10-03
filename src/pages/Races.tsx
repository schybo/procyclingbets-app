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
import { useState } from "react";

const Races = () => {
  const [viewState, setViewState] = useState('active');

  return (
    <>
      <IonHeader className="flex flex-row items-center justify-center h-[57px]">
        <img className="h-8 ml-6 mr-2" src="assets/icon/iconClear.png"></img>
        <IonToolbar className="inline-block">
          <IonTitle className="mx-0 px-0 h-8">Races</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
          <ul className="flex flex-wrap -mb-px items-center w-full block justify-center">
            <li className="inline-block mr-2">
              <button
                onClick={() => setViewState('active')}
                className={`inline-block p-4 border-b-2 border-solid rounded-t-lg ${viewState == 'active' ? 'active text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
              >
                Active
              </button>
            </li>
            <li className="inline-block mr-2">
              <button
                onClick={() => setViewState('archived')}
                className={`inline-block p-4 border-b-2 border-solid rounded-t-lg ${viewState == 'archived' ? 'active text-blue-600 border-blue-600' : 'border-transparent hover:text-gray-600 hover:border-gray-300'}`}
              >
                Archived
              </button>
            </li>
          </ul>
        </div>
        <div className="pt-4 pb-20">
          <ViewRaces viewState={viewState}></ViewRaces>
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
