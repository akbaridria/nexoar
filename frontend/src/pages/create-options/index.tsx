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
            Creating an option may fail if the latest VAA cannot be retrieved
            due to performance issues with the Hermes public API (Pyth Network).
            If you encounter this error, please try again until the process
            succeeds.
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
