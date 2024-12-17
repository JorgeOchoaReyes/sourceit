import { Button } from "../ui/button";
import { Download, Menu, Settings, Share2 } from "lucide-react";

export function BottomNavigation() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/50 border-t border-zinc-800">
      <div className="flex justify-around p-4">
        <Button variant="ghost" size="icon" className="opacity-50 hover:opacity-100">
          <Download className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="opacity-50 hover:opacity-100">
          <Share2 className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="opacity-50 hover:opacity-100">
          <Settings className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="opacity-50 hover:opacity-100">
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
