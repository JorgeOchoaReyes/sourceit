import React from "react"; 
import { Skeleton } from "../ui/skeleton";

interface TextLoadingProps {
  size?: "sm" | "md" | "lg";
  sourceType?: string;
}

export const TextLoading: React.FC<TextLoadingProps> = ({size, sourceType}) => {
  const Component = <div className="flex">
    <Skeleton className="md:h-12 xs:h-8 xs:w-8 md:w-12 rounded-full mr-2" />
    <div className="space-y-2">
      <Skeleton className="md:h-4 xs:h-4 xs:w-[250px] md:w-[800px]" /> 
      <Skeleton className="md:h-4 xs:h-4 xs:w-[250px] md:w-[800px]" /> 
    </div>
  </div>;
  return (
    <>
      {
        (sourceType === "audio") ? <div className="xs:text-xs md:text-md flex flex-wrap"> 
          We are transcribing the audio :{")"}, it will take a few seconds . . . .
        </div> : null
      }
      {
        new Array(size === "sm" ? 2 : size === "md" ? 4 : 8).fill(0).map((_, index) => (
          <div key={index} className="flex flex-row items-center justify-start w-full p-4">
            {Component}
          </div>
        ))
      }
    </>
  );
};