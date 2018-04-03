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
            if(text === "No anime yet!") return;
            appendTextToApp(text);
            const session_data = {}
            queryCurrentUserId(token)
                .then((res) => {
                    session_data.user_id = res.data.Viewer.id;
                    return queryAnimeMediaId(text, token);
                })
                .then((res) => {
                    session_data.media_id = res.data.Media.id;
                    return queryAnimeProgress(session_data.media_id, session_data.user_id, token)
                })
                .then(res => {
                    session_data.id = res.data.MediaList.id;
                    session_data.progress = res.data.MediaList.progress;
                    appendLineBreakToApp();
                    appendLineBreakToApp();
                    //TODO: Make this a button element
                    //TODO: Add a decrement button too
                    //TODO: Mutate the value of progress on the screen in real time
                    appendTextToApp(session_data.progress,
                        increment_progress.bind(null, session_data.id, session_data.progress, token));
                });
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
 * Append a text node to the div with the app id
 * @param {string} text The text that popualtes the text node
 */
function appendTextToApp(text, onclick_func){
    const token_msg_node = document.createTextNode(text);
    let node_to_append = token_msg_node;
    if (onclick_func){
        const div_wrapper = document.createElement("div");
        div_wrapper.onclick = onclick_func;
        div_wrapper.appendChild(token_msg_node);
        node_to_append = div_wrapper;
    }
    app_node.appendChild(node_to_append);
}

/**
 * Append a line break node to div with the app id
 */
function appendLineBreakToApp(){
    const br = document.createElement("br");
    app_node.appendChild(br);
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

    return queryAnilistAPI(query, variables, access_token)
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
            id,
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

    return queryAnilistAPI(query, variables, access_token)
}

/**
 * Search for an anime title to and obtain its mediaId
 * @param {string} anime_name Name of the anime to search for
 * @param {string} access_token OAuth token for accessing the api
 */
function queryAnimeMediaId(anime_name, access_token){
	const query =`
    query($search: String){
        Media(search: $search){
            id
        }  
    }`;

	const variables = {
	    "search": anime_name,
	};

    return queryAnilistAPI(query, variables, access_token)
}


/**
 * Mutate a media list entries progress field to whatever
 * value you want.
 * @param {int} id Id of the media list entry to mutate
 * @param {int} progress New progress value to set for the media list entry
 * @param {string} access_token OAuth token for accessing the api
 */
function mutateMediaListEntityProgress(id, progress, access_token){
    const mutation =`
    mutation($ids: [Int], $progress: Int){
        UpdateMediaListEntries(ids: $ids, progress: $progress){
            userId,
            mediaId,
            progress
        }
    }
    `;

    const variables = {
        "ids": [id],
        "progress": progress
    }

    return queryAnilistAPI(mutation, variables, access_token);
}

/**
 * Increment whatever the input progerss is by one and call the API to make that update as well.
 * @param {int} id Id of the media list entry to mutate
 * @param {int} progress New progress value to increment and set for the media list entry
 * @param {string} access_token OAuth token for accessing the api
 */
function increment_progress(id, progress, access_token){
    return mutateMediaListEntityProgress(id, progress+1, access_token)
}
