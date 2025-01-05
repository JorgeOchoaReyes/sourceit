import React from "react"; 

export const AITag = () => {
  return (
    <div className="group relative w-fit transition-transform duration-300 ">
      <div className="relative z-10 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-0.5 duration-300">
        <span className="block rounded-md bg-slate-950 px-4 py-2 font-semibold text-slate-100 duration-300">
          AI Fact Check
        </span>
      </div>
      <span className="pointer-events-none absolute -inset-4 z-0 transform-gpu rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 opacity-30 blur-xl transition-all duration-300" />
    </div>
  );
};
 