import { createColorPicker } from "../../../views/common/color/picker.js";

const referenceColor = createColorPicker({
  id: "referenceColor",
  label: "Reference/Title Color",
  value: "#000000",
  name: "referenceColor",
  required: true
});
const backgroundColor = createColorPicker({
  id: "backgroundColor",
  label: "Background Color",
  value: "#000000",
  name: "backgroundColor",
  required: true
});

const optionsForm = $("form");

setFormValues(optionsForm, {
  referenceColor: "#336699",
  backgroundColor: "#FFFFFF"
});

referenceColor.addEventListener("input", () => {
  $("h1").style.color = referenceColor.value;
});
backgroundColor.addEventListener("input", () => {
  document.body.style.backgroundColor = backgroundColor.value;
});
