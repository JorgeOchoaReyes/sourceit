import { GeistSans } from "geist/font/sans";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app"; 
import { api } from "~/utils/api"; 
import { Analytics } from "@vercel/analytics/react";
import "~/styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return ( 
    <SessionProvider session={session}>
      <div className={GeistSans.className}>
        <Component {...pageProps} />
      </div>
      <Analytics />
    </SessionProvider> 
  );
};

export default api.withTRPC(MyApp);
