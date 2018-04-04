/**
 * State enum to be used in the Authenticator object.
 */
const State = Object.freeze({"UNAUTHORIZED": 0, "FAILED": 1, "TOKEN": 2, "URL": 3});

/**
 * A class that will ping the server for either an authentication
 * URL to redirect to or an access token to the Anilist API.
 *
 */
class Authenticator{

    constructor(){
        this.state = State.UNAUTHORIZED;
        this.url = null;
        this.token = null;
    }

    /**
     * Make a request to the server for either a link or 
     * an access token which helps us determine what to
     * display to the user:
     * - A  login link to the Anilist API auth website
     * - An anime title for the most recently seen anime
     */
    authenticate(){
        return fetch("http://localhost:5000/get_auth_url_or_token", {mode: "cors"})
            .then(res => res.json())
            .then(res_json => {
                if(!res_json.success){
                    this.state = State.FAILED;
                    return this;
                }
                if(res_json.type === "url"){
                    this.state = State.URL;
                    this.url = res_json.data;
                } else if (res_json.type === "token") {
                    this.state = State.TOKEN;
                    this.token = res_json.data;
                } else {
                    //pass
                }
                return this;
        });
    }

    /**
     * Indicates that we must first authenticate
     * via the redirect URL
     */
    isUrlMode(){
        return this.state === State.URL;
    }

    /**
     * Indicates that we have an access token ready to go
     */
    isTokenMode(){
        return this.state === State.TOKEN;
    }
}

function getAnilistAPIConnector(access_token){

    return{

        /**
        * Queries the Anilist GraphQL API
        * @param {string} query The GraphQL query that you want to run
        * @param {Object} variables The values for the variables in your query
        * @return {Promise} Contains JSON response from API
        */
        callAnilistAPI(action, variables){

            let url = 'https://graphql.anilist.co';
            let options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + access_token
                },
                body: JSON.stringify({
                    query: action,
                    variables: variables
                })
            };

            return fetch(url, options)
                    .then(res => res.json());
        },

        /**
        * Get the user id and user name for the
        * currently authenticated user.
        */
        queryCurrentUserId(){
            const query =`
            {
                Viewer{
                    id,
                    name
                }
            }
            `;

            const variables = {};

            return this.callAnilistAPI(query, variables);
        },

        /**
        * Given the id for an anime and a user query the
        * Anilist API to get the progress that the user
        * has made so far on the anime.
        * @param {number} media_id The id for the anime that you want progress information
        * @param {number} user_id The id for the user whose progress information you want
        */
        queryAnimeProgress(media_id, user_id){
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

            return this.callAnilistAPI(query, variables);
        },

        /**
        * Search for an anime title to and obtain its mediaId
        * @param {string} anime_name Name of the anime to search for
        */
        queryAnimeMediaId(anime_name){
            const query =`
                query($search: String){
                    Media(search: $search){
                        id
                    }
                }`;

            const variables = {
                "search": anime_name
            };

            return this.callAnilistAPI(query, variables, access_token);
        },


        /**
        * Mutate a media list entries progress field to whatever
        * value you want.
        * @param {int} id Id of the media list entry to mutate
        * @param {int} progress New progress value to set for the media list entry
        */
        mutateMediaListEntityProgress(id, progress){
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
            };

            return this.callAnilistAPI(mutation, variables, access_token);
        },

        /**
        * Increment whatever the input progerss is by one and call the API to make that update as well.
        * @param {int} id Id of the media list entry to mutate
        * @param {int} progress New progress value to increment and set for the media list entry
        */
        increment_progress(id, progress){
            return mutateMediaListEntityProgress(id, progress+1, access_token);
        }

    };
}


