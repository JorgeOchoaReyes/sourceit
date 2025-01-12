import { Button } from "../ui/button";
import { Menu, Github, Youtube } from "lucide-react"; 
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

export function Sidebar() {
  return (
    <div className="hidden md:flex flex-col gap-6 w-16 bg-zinc-900/50 p-4">
      <Button variant="ghost" size="icon" className="opacity-50 hover:opacity-100" 
        onClick={() => { 
          window.open("https://github.com/JorgeOchoaReyes/sourceit");
        }}
      >
        <Github className="w-5 h-5" />
      </Button>  
      <Popover>
        <PopoverTrigger asChild> 
          <Button variant="ghost" size="icon" className="opacity-50 hover:opacity-100 md:mt-auto">
            <Menu className="w-5 h-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="md:w-80 xs:w-full bg-white "> 
          <Button variant="ghost" size="sm" className="w-full" 
            onClick={() => {
              window.open("https://cobalt.tools/");
            }}
          > 
            <Youtube className="w-5 h-5" color="red" />
              Download Youtube Audio Content Here :{")"}
          </Button> 
        </PopoverContent>
      </Popover>
    </div>
  );
}

