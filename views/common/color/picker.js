function createColorPickerWrapper(id) {
  const wrapper = document.createElement("div");
  wrapper.id = id;
  return wrapper;
}

export function createColorPicker({ renderTo, id, name, value, required }) {
  const wrapper = renderTo ? $(renderTo) : createColorPickerWrapper(renderTo);
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
  name = name || id;
  picker.name = name;
  picker.value = value;
  picker.required = required;

  // Create a MutationObserver instance
  const observer = new MutationObserver(mutationsList => {
    for (const mutation of mutationsList) {
      if (mutation.type === "attributes" && mutation.attributeName === "value") {
        //console.info("Input value changed to:", picker.value);
        // Add your custom logic here
        pickerValueChanged();
      }
    }
  });

  // Configure the observer to watch for attribute changes
  observer.observe(picker, {
    attributes: true, // Observe attribute changes
    attributeFilter: ["value"] // Only observe changes to the 'value' attribute
  });

  function pickerValueChanged() {
    //console.warn("picker input", picker.value);
    color.value = picker.value;
    color.setCustomValidity("");
    wrapper.value = color.value;
    const event = new Event("input", { bubbles: true });
    wrapper.dispatchEvent(event);
  }

  picker.addEventListener("input", pickerValueChanged);

  // picker.addEventListener("change", function (e) {
  //   console.info("Color picker value changed to:", picker.value, e);
  // });

  color.addEventListener(
    "input",
    debounce(() => {
      if (validateColorInput(color)) {
        picker.value = color.value;
        const inputEvent = new Event("input", { bubbles: true });
        picker.dispatchEvent(inputEvent);
        const changeEvent = new Event("change", { bubbles: true });
        picker.dispatchEvent(changeEvent);
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
