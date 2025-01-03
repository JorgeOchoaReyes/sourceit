import React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle, 
} from "../ui/drawer";
import { Button } from "../ui/button";

interface FactCheckDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const FactCheckDrawer: React.FC<FactCheckDrawerProps> = ({
  open,
  onClose,
}) => {
  return (
    <Drawer open={open} onClose={onClose} >
      <DrawerContent className="bg-black text-white">
        <DrawerHeader>
          <DrawerTitle>Fact Check</DrawerTitle>
          
        </DrawerHeader>
        <DrawerFooter> 
          <DrawerClose>
            <Button >Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};