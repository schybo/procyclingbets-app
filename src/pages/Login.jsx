import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../supabaseClient";
import { Capacitor } from '@capacitor/core';
import {
  useIonRouter,
} from "@ionic/react";
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

let clientId = Capacitor.getPlatform() === 'android' ? '105848017008-81jl6dttjr5upr00v9ra18qklti3lbtm.apps.googleusercontent.com' : '105848017008-d024o69dleuo1jkir4v67v2p009dicmp.apps.googleusercontent.com';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL

export function Login({ text }) {
  // GoogleAuth.initialize({
  //   clientId: clientId,
  //   scopes: ['profile', 'email']
  // });
  GoogleAuth.initialize()

  const router = useIonRouter();
  const signInWithProvider = async (provider) => {
    const redirectTo = Capacitor.getPlatform() === 'android' ? 'com.procyclingbets.app://auth' : 'http://localhost:8100/auth';
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) console.error(error);
  };

  // Capacitor.getPlatform(); // -> 'web', 'ios' or 'android'
  const handleGoogleSignIn = async () => {
    // use hook after platform dom ready

    // signInWithProvider('google')
    console.log("I pressed the button")
    let googleUser = await GoogleAuth.signIn();
    console.log("GOOGLE USER")
    console.log(googleUser)
    await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: googleUser.authentication.idToken,
    })
    router.push("/race", "forward", "replace");
    // try {
    //   // whatever route you want to deeplink to; make sure to configure in dashboard
    //   // const redirectUri = "your-scheme://login";
    //   const redirectUri = "localhost:8100"
    //   const provider = "google";
    //   const response = await fetch(
    //     `${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${redirectUri}`
    //   );
    //   console.log(response)

    //   if (response.ok) {
    //     const url = response.url;
    //     const params = url.split("#")[1];
    //     const accessToken = params.split("&")[0].split("=")[1];
    //     const refreshToken = params.split("&")[2].split("=")[1];

    //     const { data, error } = await supabase.auth.setSession({
    //       access_token: accessToken,
    //       refresh_token: refreshToken
    //     });
    //     if (error) {
    //       // handle error
    //     }
    //   }
    // } catch (error) {
    //   console.log(error)
    // }
  };

  const providers = Capacitor.getPlatform() === 'web' ? ['google'] : []
  const redirectTo = Capacitor.getPlatform() === 'android' ? 'com.procyclingbets.app://auth' : 'http://localhost:8100';
  const isAndroid = Capacitor.getPlatform() === 'android'

  return (
    <section className="bg-gray-50 dark:bg-gray-900 h-full">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
        <a
          href="/"
          className="flex items-center flex-row flex-wrap mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
        >
          <img
            className="w-8 h-8 mr-2 block"
            // src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg"
            src="/assets/icon/icon.png"
            alt="logo"
          />
          Pro Cycling Bets
        </a>
        { isAndroid && (
          <div>
            <button
              type="button"
              onClick={() => handleGoogleSignIn()}
              className="text-white bg-gradient-to-r inline-flex items-center from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-sm text-sm px-5 py-2.5 text-center mr-2 mb-2"
            >Hello 1</button>
          </div>
          )
        }
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space">
            <Auth
              supabaseClient={supabase}
              providers={providers}
              // providers={["google", "github", "facebook", "discord"]}
              appearance={{ theme: ThemeSupa }}
              redirectTo={redirectTo}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
