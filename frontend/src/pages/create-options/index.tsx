import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import OptionForm from "./components/option-form";
import OptionVisualization from "./components/option-visualization";
import { AlertTriangle } from "lucide-react";

const CreateOptions = () => {
  return (
    <div className="space-y-4">
      <Alert className="mb-4" variant="destructive">
        <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
        <div>
          <AlertTitle>Option Creation Issue</AlertTitle>
          <AlertDescription>
            Option creation may fail if the latest VAA (price update) cannot be
            retrieved from the Hermes public API (Pyth Network). If this
            happens, please retry the process until it succeeds.
          </AlertDescription>
        </div>
      </Alert>
      <div className="mt-0 md:mt-8 p-4 md:p-0 flex gap-8 flex-col md:flex-row">
        <OptionForm />
        <OptionVisualization />
      </div>
    </div>
  );
};

export default CreateOptions;
