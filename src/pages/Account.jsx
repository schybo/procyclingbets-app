import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonTitle,
  IonToolbar,
  useIonLoading,
  useIonToast,
  useIonRouter,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { Avatar } from "../components/Avatar";
import { supabase } from "../supabaseClient";

export function AccountPage() {
  const [showLoading, hideLoading] = useIonLoading();
  const [showToast] = useIonToast();
  const router = useIonRouter();
  const [profile, setProfile] = useState({
    username: "",
    website: "",
    avatar_url: "",
  });

  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    getProfile();
    return () => {};
  }, [session]);

  const getProfile = async () => {
    console.log("get");
    const {
      data: { userPulled },
    } = await supabase.auth.getUser();
    setUser(userPulled);
    await showLoading();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let { data, error, status } = await supabase
        .from("profiles")
        .select(`username, website, avatar_url`)
        .eq("id", user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }
      if (data) {
        console.log("Profile data");
        console.log(data);
        setProfile({
          username: data.username,
          website: data.website,
          avatar_url: data.avatar_url,
        });
      }
    } catch (error) {
      showToast({ message: error.message, duration: 5000 });
    } finally {
      await hideLoading();
    }
  };
  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/", "forward", "replace");
  };
  const updateProfile = async (e, avatar_url) => {
    e?.preventDefault();
    console.log("update ");
    await showLoading();
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("USER");
      console.log(user);
      console.log("PROFILE");
      console.log(profile);
      const updates = {
        id: user.id,
        ...profile,
        username: user?.email,
        avatar_url: avatar_url,
        updated_at: new Date(),
      };
      let { error } = await supabase.from("profiles").upsert(updates);
      if (error) {
        throw error;
      }
    } catch (error) {
      showToast({ message: error.message, duration: 5000 });
    } finally {
      await hideLoading();
    }
  };
  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Account</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="w-full pt-8 pb-20 h-full">
          <section className="h-full">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0">
              {/* <Avatar url={profile.avatar_url} onUpload={updateProfile}></Avatar> */}
              <form onSubmit={updateProfile}>
                <IonItem>
                  <IonLabel>
                    <p>Email</p>
                    <p>{session?.user?.email}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Name</IonLabel>
                  <IonInput
                    type="text"
                    name="username"
                    value={profile.username}
                    onIonChange={(e) =>
                      setProfile({ ...profile, username: e.detail.value ?? "" })
                    }
                  ></IonInput>
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Website</IonLabel>
                  <IonInput
                    type="url"
                    name="website"
                    value={profile.website}
                    onIonChange={(e) =>
                      setProfile({ ...profile, website: e.detail.value ?? "" })
                    }
                  ></IonInput>
                </IonItem>
                <div className="ion-text-center">
                  <IonButton fill="clear" type="submit" className="mt-8 text-white bg-gradient-to-r inline-flex items-center from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-sm text-sm px-5 py-1 text-center mr-2 mb-2">
                    Update Profile
                  </IonButton>
                </div>
              </form>
              <div className="ion-text-center">
                <IonButton fill="clear" onClick={signOut}>
                  Log Out
                </IonButton>
              </div>
            </div>
          </section>
        </div>
      </IonContent>
    </>
  );
}
