function createLabel(id, label) {
  const el = document.createElement("label");
  el.htmlFor = `${id}-input`;
  el.textContent = label || id;
  return el;
}

function createField(id) {
  const field = document.createElement("div");
  field.id = id + "-field";
  return field;
}

export function createColorPicker({ id, name, label, value, required }) {
  const field = $(`#${id}-field`) || createField(id, label);
  field.classList.add("form-field");
  if (label) {
    field.appendChild(createLabel(id, label));
  }

  const wrapper = document.createElement("div");
  wrapper.className = "color-picker";
  const color = document.createElement("input");
  color.id = `${id}-input`;
  color.type = "text";
  color.value = value;
  color.required = required;
  color.placeholder = "#RRGGBB";
  color.maxlength = "7";

  const picker = document.createElement("input");
  picker.id = id;
  picker.type = "color";
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
    // simulate input event and add input value to the field
    field.value = color.value;
    const event = new Event("input", { bubbles: true });
    field.dispatchEvent(event);
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
  field.appendChild(wrapper);
  return field;
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
