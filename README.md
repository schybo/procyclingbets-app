# Supabase Ionic React User Management

> This project is based on the Supabase Ionic React user management [Quickstart](https://supabase.io/docs/guides/with-ionic-react)
> To keep it in sync with this Quickstart, architecture choices have been made to facilitate the comparison

This example will set you up for a very common situation: users can sign up with a magic link and then update their account with profile information, including a profile image.

This demonstrates how to use:

- User signups using Supabase [Auth](https://supabase.io/auth).
- User avatar images using Supabase [Storage](https://supabase.io/storage).
- Frontend using [React](http://reactjs.org).

## Technologies used

- Frontend:
  - [Ionic](https://ionicframework.com)
  - [Capacitor](https://capacitorjs.com)
  - [React](https://reactjs.org)
  - [Supabase.js](https://supabase.io/docs/library/getting-started) for user management and realtime data syncing.
- Backend:
  - [app.supabase.io](https://app.supabase.io/): hosted Postgres database with restful API for usage with Supabase.js.

## Instant deploy

The Vercel deployment will guide you through creating a Supabase account and project. After installation of the Supabase integration, all relevant environment variables will be set up so that the project is usable immediately after deployment 🚀.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?project-name=supabase-ionic-react&repo-name=supabase-ionic-react&envDescription=Find%20the%20Supabase%20URL%20and%20key%20in%20the%20your%20auto-generated%20docs%20at%20app.supabase.io&repository-url=https%3A%2F%2Fgithub.com%2Fmhartington%2Fsupabase-ionic-react%2Ftree%2Fmain&env=REACT_APP_SUPABASE_URL%2CREACT_APP_SUPABASE_KEY)

## Build from scratch

### 1. Create new project

Sign up to Supabase - [https://app.supabase.io](https://app.supabase.io) and create a new project. Wait for your database to start.

### 2. Run "User Management" Quickstart

Once your database has started, run the "User Management Starter" quickstart. Inside of your project, enter the `SQL editor` tab and scroll down until you see `User Management Starter: Set up a Public Profiles table which you can access with your API`.

### 3. Get the URL and Key

Go to the Project Settings (the cog icon), open the API tab, and find your API URL and `anon` key, you'll need these in the next step.

The `anon` key is your client-side API key. It allows "anonymous access" to your database, until the user has logged in. Once they have logged in, the keys will switch to the user's own login token. This enables row level security for your data. Read more about this [below](#postgres-row-level-security).

![image](https://user-images.githubusercontent.com/10214025/88916245-528c2680-d298-11ea-8a71-708f93e1ce4f.png)

**_NOTE_**: The `service_role` key has full access to your data, bypassing any security policies. These keys have to be kept secret and are meant to be used in server environments and never on a client or browser.

### 4. Env vars

Update your environment file `environment.ts`

```
export const environment = {
  // ...
  supabaseUrl: "YOUR_SUPBASE_URL",
  supbaseKey: "YOUR_SUPABASE_KEY"
};
```

Populate this file with your URL and Key.

### 5. Run the application

Run the application: `ionic serve` and the browser will open to `https://localhost:8100/` and you are ready to go 🚀.

## Supabase details

### Postgres Row level security

This project uses very high-level Authorization using Postgres' Role Level Security.
When you start a Postgres database on Supabase, we populate it with an `auth` schema, and some helper functions.
When a user logs in, they are issued a JWT with the role `authenticated` and thier UUID.
We can use these details to provide fine-grained control over what each user can and cannot do.

This is a trimmed-down schema, with the policies:

```sql
-- Create a table for Public Profiles
create table profiles (
  id uuid references auth.users not null,
  updated_at timestamp with time zone,
  username text unique,
  avatar_url text,
  website text,

  primary key (id),
  unique(username),
  constraint username_length check (char_length(username) >= 3)
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Set up Realtime!
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table profiles;

-- Set up Storage!
insert into storage.buckets (id, name)
values ('avatars', 'avatars');

create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );
```

## Authors

- [Supabase](https://supabase.io)
- [Mike Hartington](https://github.com/mhartington)

Supabase is open source. We'd love for you to follow along and get involved at https://github.com/supabase/supabase

# Releasing for Android

```
cd android &&
<!-- FOR JUST APK -->
./gradlew assembleRelease &&
<!-- FOR ABB -->
./gradlew bundleRelease &&
cd app/build/outputs/apk/release &&

java -jar keys/pepk.jar --keystore=pcb.keystore --alias=pcb --output=output.zip --include-cert --rsa-aes-encryption --encryption-key-path=/Users/brentscheibelhut/procyclingbets-app/keys/encryption_public_key.pem

jarsigner -keystore /Users/brentscheibelhut/procyclingbets-app/pcb.keystore app-release.aab pcb

jarsigner -keystore /Users/brentscheibelhut/procyclingbets-app/pcb.keystore app-release-unsigned.apk pcb &&
/Users/brentscheibelhut/Library/Android/sdk/build-tools/30.0.2/zipalign 4 app-release-unsigned.apk app-release.apk
```
