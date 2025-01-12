import { Button } from "../ui/button";
import { Download, Menu, } from "lucide-react";

export function Sidebar() {
  return (
    <div className="hidden md:flex flex-col gap-6 w-16 bg-zinc-900/50 p-4">
      <Button variant="ghost" size="icon" className="opacity-50 hover:opacity-100">
        <Download className="w-5 h-5" />
      </Button> 
      <div className="flex-1" />  
      <Button variant="ghost" size="icon" className="opacity-50 hover:opacity-100">
        <Menu className="w-5 h-5" />
      </Button>
    </div>
  );
}

