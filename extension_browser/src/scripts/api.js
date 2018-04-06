function getAnilistAPIConnector(access_token){

    return {
        /**
        * Queries the Anilist GraphQL API
        * @param {string} query The GraphQL query that you want to run
        * @param {Object} variables The values for the variables in your query
        * @return {Promise} Contains JSON response from API
        */
        callAnilistAPI(query, variables){

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
            }`;

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
                    Media(search: $search, type: ANIME){
                        id,
                        siteUrl
                    }
                }`;

            const variables = {
                "search": anime_name
            };

            return this.callAnilistAPI(query, variables);
        },


        /**
         * Given a user and anime id create an Anilist follow with zero-progress
         * for the (user, anime) pair.
         * @param {int} media_id ID of the anime
         * @param {int} user_id ID of the user
         */
        createMediaListEntity(media_id){
            const mutation=`
            mutation($mediaId: Int, $progress: Int, $status: MediaListStatus){
                SaveMediaListEntry(mediaId: $mediaId, progress: $progress, status: $status){
                    id,
                    userId,
                    mediaId,
                    progress
                }
            }`;

            const variables = {
                "mediaId": media_id,
                "progress": 0,
                "status": "CURRENT"
            };

            return this.callAnilistAPI(mutation, variables);
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

            return this.callAnilistAPI(mutation, variables);
        },

        /**
        * Increment whatever the input progress is by one and call the API to make that update as well.
        * @param {int} id Id of the media list entry to mutate
        * @param {int} progress New progress value to increment and set for the media list entry
        */
        incrementProgress(id, progress){
            return this.mutateMediaListEntityProgress(id, progress+1);
        },

        /**
        * Decrement whatever the input progress is by one and call the API to make that update as well.
        * @param {int} id Id of the media list entry to mutate
        * @param {int} progress New progress value to decrement and set for the media list entry
        */
        decrementProgress(id, progress){
            return this.mutateMediaListEntityProgress(id, progress-1);
        },
    };

}
