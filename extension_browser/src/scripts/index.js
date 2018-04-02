const app_node = document.getElementById("app");

fetch("http://localhost:5000/get_auth_url_or_token", {mode: "cors",})
	.then(res => res.json())
	.then(res_json => {
		if(!res_json.success){
			console.error("Could not fetch data")
		}
		if(res_json.type === "url"){
            let text = "Log into Anilist";
            let url = res_json.data;
            appendURLToApp(text, url);
		} else if (res_json.type === "token") {
			let text = computePopupTextContent("CRTitle", "No anime yet!");
			let token = res_json.data;
            appendTextToApp(text);
            queryAnimeByTitle(text, token);
		}
	});

function computePopupTextContent(key, default_value){
	const text = localStorage.getItem(key)
	if(!text) return default_value
	return text
}

function appendTextToApp(text){
    const token_msg_node = document.createTextNode(text);
    app_node.appendChild(token_msg_node);
}

function appendURLToApp(text, link){
    const auth_url_node = document.createElement("a");
    const auth_url_text_node = document.createTextNode(text);
    auth_url_node.append(auth_url_text_node);
    auth_url_node.title = text;
    auth_url_node.href = link;
    app_node.appendChild(auth_url_node);
}

function queryAnimeByTitle(title, access_token){
	// Here we define our query as a multi-line string
	// Storing it in a separate .graphql/.gql file is also possible
	/*
		let query = `
		query{
			User(name: "my-username"){
				id
			}
		}
	*/
	//TODO: 
	//1. Get userId
	//2.Get MediaId 
	//3. Feed into query
	let query = `
	{
		MediaList(mediaId: 98460, userId: 80196){
	    progress,
	    status,
	    media{
	      title {
	        romaji
	        english
	        native
	        userPreferred
	      }
	    },
	    user{
	      name
	    }
	  }  
	}
	`;

	// Define our query variables and values that will be used in the query request
	let variables = {
	    "search": title
	};

	// Define the config we'll need for our Api request
	let url = 'https://graphql.anilist.co',
	    options = {
	        method: 'POST',
	        headers: {
	            'Content-Type': 'application/json',
	            'Accept': 'application/json',
	            'Authorization': 'Bearer ' + access_token
	        },
	        body: JSON.stringify({
	            query: query,
	            variables: variables
	        })
	    };

	// Make the HTTP Api request
	fetch(url, options).then(handleResponse)
	                   .then(handleData)
	                   .catch(handleError);

	function handleResponse(response) {
	    return response.json().then(function (json) {
	    	console.log(response)
	    	console.log(json)
	        return response.ok ? json : Promise.reject(json);
	    });
	}

	function handleData(data) {
		console.log(data)
	}

	function handleError(error) {
	    alert('Error, check console');
	    console.log(error);
	}
}