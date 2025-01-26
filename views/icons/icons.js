const icons = {
  // https://www.svgrepo.com/svg/460877/cross-circle
  close: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="cross-circle" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><line id="secondary" x1="15" y1="15" x2="9" y2="9" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line><line id="secondary-2" data-name="secondary" x1="9" y1="15" x2="15" y2="9" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line><circle id="primary" cx="12" cy="12" r="9" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></circle></g></svg>`,
  // https://www.svgrepo.com/svg/460715/chat-alt-5
  liveChat: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="chat-alt-5" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="secondary" d="M12,10h.1M7.9,10H8m8,0h.1" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="primary" d="M21,4V16a1,1,0,0,1-1,1H13L8,21V17H4a1,1,0,0,1-1-1V4A1,1,0,0,1,4,3H20A1,1,0,0,1,21,4Z" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>`,
  // https://www.svgrepo.com/svg/463232/stop?edit=true
  lightStop: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="stop" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><rect id="primary" x="3" y="3" width="18" height="18" rx="1" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></rect></g></svg>`,
  // --
  lightSettings: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="filter-alt" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="primary" d="M5,3V17M12,7V21m7-7v7m0-11V3" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="secondary" d="M5,17a2,2,0,1,0,2,2A2,2,0,0,0,5,17ZM12,3a2,2,0,1,0,2,2A2,2,0,0,0,12,3Zm7,7a2,2,0,1,0,2,2A2,2,0,0,0,19,10Z" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>`,
  // https://www.svgrepo.com/svg/461454/filter-alt
  settings: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="filter-alt" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="primary" d="M5,3V17M12,7V21m7-7v7m0-11V3" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="secondary" d="M5,17a2,2,0,1,0,2,2A2,2,0,0,0,5,17ZM12,3a2,2,0,1,0,2,2A2,2,0,0,0,12,3Zm7,7a2,2,0,1,0,2,2A2,2,0,0,0,19,10Z" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>`,
  // https://www.svgrepo.com/svg/462378/question
  question: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="question" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="secondary" d="M12,13c0-2,3-1,3-4S9,6,9,9" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><line id="secondary-upstroke" x1="12.05" y1="17" x2="11.95" y2="17" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line><circle id="primary" cx="12" cy="12" r="9" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></circle></g></svg>`,
  // https://www.svgrepo.com/svg/463034/search
  lightSearch: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="search" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><line id="secondary" x1="21" y1="21" x2="15" y2="15" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line><circle id="primary" cx="10" cy="10" r="7" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></circle></g></svg>`,
  // https://www.svgrepo.com/svg/463034/search
  search: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="search" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><line id="secondary" x1="21" y1="21" x2="15" y2="15" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line><circle id="primary" cx="10" cy="10" r="7" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></circle></g></svg>`,
  // https://www.svgrepo.com/svg/461399/file-favorite-6?edit=true
  lightFavorite: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="file-favorite-6" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="secondary" d="M17,13H11m6-4H11" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="star" d="M5.76,16.3,3,16.67l2,1.8L4.53,21,7,19.8,9.47,21,9,18.47l2-1.8L8.24,16.3,7,14Z" style="fill: none; stroke: #ff3d4d; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="primary" d="M7,10V4A1,1,0,0,1,8,3h9l4,4V20a1,1,0,0,1-1,1H14" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>`,
  // https://www.svgrepo.com/svg/461399/file-favorite-6?edit=true
  favorite: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="file-favorite-6" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="secondary" d="M17,13H11m6-4H11" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="star" d="M5.76,16.3,3,16.67l2,1.8L4.53,21,7,19.8,9.47,21,9,18.47l2-1.8L8.24,16.3,7,14Z" style="fill: none; stroke: #ff3d4d; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="primary" d="M7,10V4A1,1,0,0,1,8,3h9l4,4V20a1,1,0,0,1-1,1H14" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>`,
  // https://www.svgrepo.com/svg/460783/clipboard-edit
  edit: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="clipboard-edit" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="primary" d="M13,5h3a1,1,0,0,1,1,1v4" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="primary-2" data-name="primary" d="M7,5H4A1,1,0,0,0,3,6V20a1,1,0,0,0,1,1H16a1,1,0,0,0,1-1V16" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="secondary" d="M13,4a1,1,0,0,0-1-1H8A1,1,0,0,0,7,4V7h6Zm7.71,6.69-1.4-1.4a1,1,0,0,0-1.4,0L13,14.2V17h2.8l4.91-4.91A1,1,0,0,0,20.71,10.69Z" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>`,
  // https://www.svgrepo.com/svg/469721/save
  save: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="save" data-name="Flat Line" xmlns="http://www.w3.org/2000/svg" class="icon flat-line" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="secondary" d="M16,3H5A1,1,0,0,0,4,4V20a1,1,0,0,0,1,1H8V15h8v6h3a1,1,0,0,0,1-1V7Z" style="fill: #2ca9bc; stroke-width: 2;"></path><path id="primary" d="M8,7h2m6,8H8v6h8ZM16,3H5A1,1,0,0,0,4,4V20a1,1,0,0,0,1,1H19a1,1,0,0,0,1-1V7Z" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>`,
  lightSave: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="save" data-name="Flat Line" xmlns="http://www.w3.org/2000/svg" class="icon flat-line"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="secondary" d="M16,3H5A1,1,0,0,0,4,4V20a1,1,0,0,0,1,1H8V15h8v6h3a1,1,0,0,0,1-1V7Z" style="fill: #2ca9bc; stroke-width: 2;"></path><path id="primary" d="M8,7h2m6,8H8v6h8ZM16,3H5A1,1,0,0,0,4,4V20a1,1,0,0,0,1,1H19a1,1,0,0,0,1-1V7Z" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>`,
  // https://www.svgrepo.com/svg/462313/plus
  add: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="plus" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="primary" d="M5,12H19M12,5V19" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>`,
  // https://www.svgrepo.com/svg/460558/bring-front-2?edit=true
  projectAll: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="bring-front-2" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="secondary" d="M11,17v3a1,1,0,0,1-1,1H4a1,1,0,0,1-1-1V14a1,1,0,0,1,1-1H7" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="secondary-2" data-name="secondary" d="M13,7V4a1,1,0,0,1,1-1h6a1,1,0,0,1,1,1v6a1,1,0,0,1-1,1H17" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><rect id="primary" x="7" y="7" width="10" height="10" rx="1" transform="translate(24) rotate(90)" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></rect></g></svg>`,
  // https://www.svgrepo.com/svg/460558/bring-front-2
  bringToFront: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="bring-front-2" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="secondary" d="M11,17v3a1,1,0,0,1-1,1H4a1,1,0,0,1-1-1V14a1,1,0,0,1,1-1H7" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="secondary-2" data-name="secondary" d="M13,7V4a1,1,0,0,1,1-1h6a1,1,0,0,1,1,1v6a1,1,0,0,1-1,1H17" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><rect id="primary" x="7" y="7" width="10" height="10" rx="1" transform="translate(24) rotate(90)" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></rect></g></svg>`,
  // https://www.svgrepo.com/svg/460774/clipboard-checklist
  copyIcon: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="clipboard-checklist" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="primary" d="M9,5H6A1,1,0,0,0,5,6V20a1,1,0,0,0,1,1H18a1,1,0,0,0,1-1V6a1,1,0,0,0-1-1H15" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="secondary" d="M15,4a1,1,0,0,0-1-1H10A1,1,0,0,0,9,4V7h6ZM9,14l2,2,4-4" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>`,
  // https://www.svgrepo.com/svg/460777/clipboard-checklist-4
  copyAll: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="clipboard-checklist-4" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="primary" d="M18,14V6a1,1,0,0,0-1-1H14" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="primary-2" data-name="primary" d="M11,21H5a1,1,0,0,1-1-1V6A1,1,0,0,1,5,5H8" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="secondary" d="M14,4a1,1,0,0,0-1-1H9A1,1,0,0,0,8,4V7h6ZM8,17h3M8,13h6m0,6,2,2,4-4" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>`,
  // https://www.svgrepo.com/svg/461048/delete-alt-2
  remove: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="delete-alt-2" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="secondary" d="M16,7V4a1,1,0,0,0-1-1H9A1,1,0,0,0,8,4V7m4,4v6" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="primary" d="M4,7H20M17.07,20.07,18,7H6l.93,13.07a1,1,0,0,0,1,.93h8.14A1,1,0,0,0,17.07,20.07Z" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>`,
  // https://www.svgrepo.com/svg/461052/delete-alt
  removeAll: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="delete-alt" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="secondary" d="M16,7V4a1,1,0,0,0-1-1H9A1,1,0,0,0,8,4V7m2,4v6m4-6v6" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="primary" d="M4,7H20M18,20V7H6V20a1,1,0,0,0,1,1H17A1,1,0,0,0,18,20Z" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>`,
  // https://www.svgrepo.com/svg/462058/more-circle-horizontal?edit=true
  lightMore: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="more-circle-horizontal" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><line id="secondary-upstroke" x1="17.05" y1="12" x2="16.95" y2="12" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line><line id="secondary-upstroke-2" data-name="secondary-upstroke" x1="12.05" y1="12" x2="11.95" y2="12" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line><line id="secondary-upstroke-3" data-name="secondary-upstroke" x1="7.05" y1="12" x2="6.95" y2="12" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line><circle id="primary" cx="12" cy="12" r="9" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></circle></g></svg>`,
  // https://www.svgrepo.com/svg/460835/computer-gaming-mouse?edit=true
  lightMouse: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="computer-gaming-mouse" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="secondary" d="M12,3v7M6,10H18" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="primary" d="M16.28,3.89A3,3,0,0,1,18,6.61V15a6,6,0,0,1-6,6h0a6,6,0,0,1-6-6V6.61A3,3,0,0,1,7.72,3.89,10.14,10.14,0,0,1,12,3,10.14,10.14,0,0,1,16.28,3.89Z" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>`,
  // https://www.svgrepo.com/svg/460853/copy
  copy: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="copy" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="secondary" d="M5,6V20a1,1,0,0,0,1,1H16" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><polygon id="primary" points="19 6 19 17 9 17 9 3 16 3 19 6" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></polygon></g></svg>`,
  // https://www.svgrepo.com/svg/460200/add-file-4
  addSlide: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="add-file-4" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="secondary" d="M16,19h4m-2-2v4" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="primary" d="M18,13V7L14,3H5A1,1,0,0,0,4,4V20a1,1,0,0,0,1,1h7" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>`,
  // https://www.svgrepo.com/svg/461424/file-remove
  removeSlide: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="file-remove" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><line id="secondary" x1="20" y1="18" x2="14" y2="18" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line><path id="primary" d="M10,20H4a1,1,0,0,1-1-1V4A1,1,0,0,1,4,3h8.59a1,1,0,0,1,.7.29l3.42,3.42a1,1,0,0,1,.29.7V12" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>`,
  // https://www.svgrepo.com/svg/464907/export
  export: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="export" data-name="Flat Color" xmlns="http://www.w3.org/2000/svg" class="icon flat-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="secondary" d="M21,2H17a1,1,0,0,0,0,2h1.59l-8.3,8.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L20,5.41V7a1,1,0,0,0,2,0V3A1,1,0,0,0,21,2Z" style="fill: #2ca9bc;"></path><path id="primary" d="M18,22H4a2,2,0,0,1-2-2V6A2,2,0,0,1,4,4h6.11a1,1,0,0,1,0,2H4V20H18V13.89a1,1,0,0,1,2,0V20A2,2,0,0,1,18,22Z" style="fill: #000000;"></path></g></svg>`,
  // https://www.svgrepo.com/svg/465297/import-left
  import: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="import-left" data-name="Flat Color" xmlns="http://www.w3.org/2000/svg" class="icon flat-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="secondary" d="M21.71,2.29a1,1,0,0,0-1.42,0L12,10.59V9a1,1,0,0,0-2,0v4a1,1,0,0,0,1,1h4a1,1,0,0,0,0-2H13.41l8.3-8.29A1,1,0,0,0,21.71,2.29Z" style="fill: #2ca9bc;"></path><path id="primary" d="M18,22H4a2,2,0,0,1-2-2V6A2,2,0,0,1,4,4h6.11a1,1,0,0,1,0,2H4V20H18V13.89a1,1,0,0,1,2,0V20A2,2,0,0,1,18,22Z" style="fill: #000000;"></path></g></svg>`,
  // https://www.svgrepo.com/svg/462411/refresh-round
  refresh: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="refresh-round" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path id="primary" d="M14,18H9A6,6,0,0,1,5.54,7.11" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><path id="primary-2" data-name="primary" d="M10,6h5a6,6,0,0,1,3.46,10.89" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path><polyline id="secondary" points="12 16 14 18 12 20" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></polyline><polyline id="secondary-2" data-name="secondary" points="12 8 10 6 12 4" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></polyline></g></svg>`,
  // https://www.svgrepo.com/svg/461716/information-chat?edit=true
  info: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="information-chat" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><line id="secondary-upstroke" x1="12.05" y1="8" x2="11.95" y2="8" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line><line id="secondary" x1="12" y1="13" x2="12" y2="16" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line><path id="primary" d="M10.54,3.11A9,9,0,0,0,4,16.11l-.7,3.41A1,1,0,0,0,4.48,20.7L7.87,20h0A9,9,0,1,0,10.54,3.11Z" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path></g></svg>`,
  // https://www.svgrepo.com/svg/461181/double-up-sign-circle
  up: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="double-up-sign-circle" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><polyline id="secondary" points="15 10.5 12 7.5 9 10.5" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></polyline><polyline id="secondary-2" data-name="secondary" points="15 15.5 12 12.5 9 15.5" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></polyline><circle id="primary" cx="12" cy="12" r="9" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></circle></g></svg>`,
  // https://www.svgrepo.com/svg/461166/double-down-sign-circle
  down: `<svg width="24px" height="24px" fill="#000000" viewBox="0 0 24 24" id="double-down-sign-circle" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><polyline id="secondary" points="9 13.5 12 16.5 15 13.5" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></polyline><polyline id="secondary-2" data-name="secondary" points="9 8.5 12 11.5 15 8.5" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></polyline><circle id="primary" cx="12" cy="12" r="9" style="fill: none; stroke: #000000; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></circle></g></svg>`,
  // https://www.svgrepo.com/svg/460823/columns?edit=true
  screenSources: `<svg width="24px" height="24px" fill="#ffffff" viewBox="0 0 24 24" id="columns" data-name="Line Color" xmlns="http://www.w3.org/2000/svg" class="icon line-color">
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <line id="secondary" x1="12" y1="21" x2="12" y2="3" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></line>
      <rect id="primary" x="3" y="3" width="18" height="18" rx="1" style="fill: none; stroke: #ffffff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></rect>
      <path id="leftLines" d="M7,8H8M7,16H8M7,12H8" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path>
      <path id="rightLines" d="M16,8H17M16,16H17M16,12H17" style="fill: none; stroke: #2ca9bc; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2;"></path>
    </g>
  </svg>`
};
