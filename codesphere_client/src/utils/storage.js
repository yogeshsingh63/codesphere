const KEY = "codesphere";
const get = () => {
	return JSON.parse(localStorage.getItem(KEY));
}
const set = (data) => {
	return localStorage.setItem(KEY, JSON.stringify(data));
}

// https://stackoverflow.com/a/20125572
const dotpropHelper = (obj, desc, value) => {
  var arr = desc ? desc.split(".") : [];

  while (arr.length && obj) {
    var comp = arr.shift();
    var match = new RegExp("(.+)\\[([0-9]*)\\]").exec(comp);

    // handle arrays
    if ((match !== null) && (match.length === 3)) {
      var arrayData = {
        arrName: match[1],
        arrIndex: match[2]
      };
      if (obj[arrayData.arrName] !== undefined) {
        if (typeof value !== 'undefined' && arr.length === 0) {
          obj[arrayData.arrName][arrayData.arrIndex] = value;
        }
        obj = obj[arrayData.arrName][arrayData.arrIndex];
      } else {
        obj = undefined;
      }

      continue;
    }

    // handle regular things
    if (typeof value !== 'undefined') {
      if (obj[comp] === undefined) {
        obj[comp] = {};
      }

      if (arr.length === 0) {
        obj[comp] = value;
      }
    }

    obj = obj[comp];
  }

  return obj;
}

const init = () => {
	try {
		if(!get() || !get().rooms || !get().projects)
			throw new Error("Storage empty!");
	}
	catch(err) {
		set({
			rooms: {},
			projects: {}
		})
	}
};

const save = (key, data) => {
	init();

	let codesphere = get();
	dotpropHelper(codesphere, key, data);
	set(codesphere);

	return codesphere;
};
const load = (key) => {
	init();

	let codesphere = get();
	return dotpropHelper(codesphere, key);
};
const remove = (key) => {
	init();

	let codesphere = get();
	dotpropHelper(codesphere, key, null);
	set(codesphere);

	return codesphere;
}


export default { get, set, save, load, remove }