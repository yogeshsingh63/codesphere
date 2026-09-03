import Cookies from 'universal-cookie';

export default function fetchWithAuth(url, options = {}) {
	const cookies = new Cookies();

	if(!options.headers) {
		options.headers = {};
	}

	if(options.body) {
		try {
			JSON.parse(options.body);
			options.headers["Content-Type"] = "application/json";
		}
		catch {}
	}

	if(typeof window !== 'undefined' && (!options.headers.Authorization && !options.noToken)) {
		const token = cookies.get("authToken");
		if(token)
			options.headers.Authorization = `Bearer ${token}`;
	}

	return fetch(url, options);
}
