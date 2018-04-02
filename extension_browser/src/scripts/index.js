// Node that contains the main app information
const app_node = document.getElementById("app");

/**
 * Make a request to the server for either a link or 
 * an access token which helps us determine what to
 * display to the user:
 * - A  login link to the Anilist API auth website
 * - An anime title for the most recently seen anime
 */
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
            queryCurrentUserId(token);
            //queryAnimeProgress(<media_id>, <user_id>, token);
		}
	});

/**
 * Attempt to grab a key from localStorage and if it does
 * not exist return a default value.
 * @param {string} key The key to try and locate in browser local storage
 * @param {string} default_value Return if key is not in browser local storage
 */
function computePopupTextContent(key, default_value){
	const text = localStorage.getItem(key)
	if(!text) return default_value
	return text
}

/**
 * Append a text node ot the div with the app id
 * @param {string} text The text that popualtes the text node
 */
function appendTextToApp(text){
    const token_msg_node = document.createTextNode(text);
    app_node.appendChild(token_msg_node);
}

/**
 * Append a <a> tag to the div with the app id
 * @param {string} text The text for the link
 * @param {string} link The actual url you get directed to upon clicking the link
 */
function appendURLToApp(text, link){
    const auth_url_node = document.createElement("a");
    const auth_url_text_node = document.createTextNode(text);
    auth_url_node.append(auth_url_text_node);
    auth_url_node.title = text;
    auth_url_node.href = link;
    app_node.appendChild(auth_url_node);
}

/**
 * Queries the Anilist GraphQL API
 * @param {string} query The GraphQL query that you want to run
 * @param {Object} variables The values for the variables in your query
 * @param {string} access_token OAuth token to access the API
 * @return {Promise} Contains JSON response from API
 */
function queryAnilistAPI(query, variables, access_token){

	let url = 'https://graphql.anilist.co';
    let options = {
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

	return fetch(url, options)
        .then(res => res.json());
}


/**
 * Get the user id and user name for the
 * currently authenticated user.
 * @param {string} access_token Token used to access the Anilist API.
 */
function queryCurrentUserId(access_token){
    const query =`
    {
        Viewer{
            id,
            name
        }
    }
    `;

    const variables = {};

    queryAnilistAPI(query, variables, access_token)
        .then(res => console.log(res));
}

/**
 * Given the id for an anime and a user query the
 * Anilist API to get the progress that the user 
 * has made so far on the anime.
 * @param {number} media_id The id for the anime that you want progress information
 * @param {number} user_id The id for the user whose progress information you want
 * @param {string} access_token OAuth token for accessing the api
 */
function queryAnimeProgress(media_id, user_id, access_token){
	const query =`
    query($mediaId: Int, $userId: Int){
        MediaList(mediaId: $mediaId, userId: $userId){
            progress,
            status,
            media{
                title {
                    romaji
                    english
                    native
                    userPreferred
                }
            }
        }  
    }`;

	// Define our query variables and values that will be used in the query request
	const variables = {
	    "mediaId": media_id,
	    "userId": user_id
	};

    queryAnilistAPI(query, variables, access_token)
        .then(handleData)
        .catch(handleError);

	function handleData(data) {
		console.log(data)
	}

	function handleError(error) {
	    console.log(error);
	}
}

