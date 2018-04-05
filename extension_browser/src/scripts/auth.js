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
