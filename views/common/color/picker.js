export function createColorPicker({ id, value, required }) {
  const wrapper = document.createElement("div");
  wrapper.className = "color-picker";

  const color = document.createElement("input");
  color.type = "text";
  color.value = value;
  color.required = required;
  color.placeholder = "#RRGGBB";
  color.maxlength = "7";

  const picker = document.createElement("input");
  picker.type = "color";
  if (id) {
    picker.id = id;
  }
  picker.value = value;
  picker.required = required;

  picker.addEventListener("input", () => {
    color.value = picker.value;
    color.setCustomValidity("");
    wrapper.value = color.value;
    const event = new Event("input", { bubbles: true });
    wrapper.dispatchEvent(event);
  });
  color.addEventListener(
    "input",
    debounce(() => {
      picker.value = color.value;
      if (validateColorInput(color)) {
        const event = new Event("input", { bubbles: true });
        picker.dispatchEvent(event);
      }
    }, 200)
  );

  wrapper.appendChild(color);
  wrapper.appendChild(picker);
  return wrapper;
}

function validateColorInput(input) {
  const hexColorPattern = /^#([A-Fa-f0-9]{6})$/; // Valid format: #RRGGBB
  if (!hexColorPattern.test(input.value)) {
    // Mark the field invalid with a custom message
    input.setCustomValidity("Please enter a valid hex color (e.g., #RRGGBB).");
    input.reportValidity();
    return false;
  } else {
    // Clear the custom validity message when valid
    input.setCustomValidity("");
    return true;
  }
}
