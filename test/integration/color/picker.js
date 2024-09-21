import { createColorPicker } from "../../../views/common/color/picker.js";

const picker = createColorPicker({
  value: "#336699",
  id: "referenceColor",
  required: true
});

$("#referenceColor-wrapper").appendChild(picker);

picker.addEventListener("input", () => {
  $("h1").style.color = picker.value;
});
