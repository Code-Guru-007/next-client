import { useState } from "react";

export default function useFroalaEditor(defaultValue = "") {
  const [model, setModel] = useState(defaultValue);

  const handleModelChange = (_model: string) => {
    setModel(_model);
  };

  return {
    model,
    setModel,
    handleModelChange,
  };
}
