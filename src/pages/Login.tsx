import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../supabaseClient";

export function Login() {
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
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space">
            <Auth
              supabaseClient={supabase}
              providers={["google", "github", "facebook", "discord"]}
              appearance={{ theme: ThemeSupa }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
