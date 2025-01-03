import React from "react"; 
import { Skeleton } from "../ui/skeleton";
 
export const TextLoading: React.FC = () => {
  const Component = <div className="flex">
    <Skeleton className="h-12 w-12 rounded-full mr-2" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-[800px]" /> 
      <Skeleton className="h-4 w-[800px]" /> 
    </div>
  </div>;
  return (
    <>
      {
        new Array(10).fill(0).map((_, index) => (
          <div key={index} className="flex flex-row items-center justify-start w-full p-4">
            {Component}
          </div>
        ))
      }
    </>
  );
};