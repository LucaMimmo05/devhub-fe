import { Button } from "@/components/ui/button";
import { Plus, Filter, RefreshCw } from "lucide-react";

export const HEADER_ACTIONS: Record<string, React.ReactNode> = {
  add: (
    <Button>
      <Plus  />
    </Button>
  ),
  filter: (
    <Button variant="outline">
      <Filter />
    </Button>
  ),
  sync: (
    <Button variant="outline">
        <RefreshCw />
    </Button>
  ),
};
