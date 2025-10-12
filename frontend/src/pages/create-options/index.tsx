import OptionForm from "./components/option-form";
import OptionVisualization from "./components/option-visualization";

const CreateOptions = () => {
  return (
    <div className="mt-0 md:mt-8 p-4 md:p-0 flex gap-8 flex-col md:flex-row">
      <OptionForm />
      <OptionVisualization />
    </div>
  );
};

export default CreateOptions;
