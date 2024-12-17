import Head from "next/head";  
import { Sidebar } from "./sidebar";
import { BottomNavigation } from "./bottom-nav";

interface LayoutProps {
    children: React.ReactNode;
    title?: string;
    meta?: React.ReactNode; 
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  meta,
}) => {
  
  return (
    <>
      <Head>
        <title>{title ? title : "Sourec It"}</title>
        <meta name="description" content="Source audio" />
        <link rel="icon" href="/favicon.ico" />
        {meta ? meta : null}
      </Head> 
      <div className="min-h-screen bg-black text-white flex">
        <Sidebar />
        {children} 
        <BottomNavigation />
      </div> 
    </>
  );
};
 