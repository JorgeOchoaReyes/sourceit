import { Button } from "../ui/button";
import { Download, Menu } from "lucide-react";

export function BottomNavigation() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800">
      <div className="flex justify-around p-2">
        <Button variant="ghost" size="icon" className="opacity-50 hover:opacity-100">
          <Download className="w-3 h-3" />
        </Button>  
        <Button variant="ghost" size="icon" className="opacity-50 hover:opacity-100">
          <Menu className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
