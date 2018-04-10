const authenticator = new Authenticator();

const app_state = {
    WAITING_SERVER:       0,
    URL:                  1,
    TOKEN:                2,
    NO_ANIME:             3,
    WAITING_API:          4,
    ANIME_FOLLOWING:      5,
    ANIME_NOT_FOLLOWING:  6
}

let AnilistAPIConn;

const app = new Vue({
    el: "#app",
    data: {
        state: app_state.WAITING_SERVER,
        url: null,
        default_title: "No anime yet",
        error_message: "Something went wrong",
        title: "",
        url: "",
        progress: -1,
        episodes : 0,
        user_id: null,
        media_id: null,
        media_list_entry_id: null
    },
    methods:{
        increment_progress(){
            if(this.progress === this.episodes) return; //Can't see more episodes than there are #s
            AnilistAPIConn.incrementProgress(app.media_list_entry_id, this.progress)
                .then(res => app.progress = res.data.UpdateMediaListEntries[0].progress);
        },
        decrement_progress(){
            if(this.progress === 0) return; //Can't see less than zero episodes
            AnilistAPIConn.decrementProgress(app.media_list_entry_id, this.progress)
                .then(res => app.progress = res.data.UpdateMediaListEntries[0].progress);
        },
        follow_anime(){
            AnilistAPIConn.createMediaListEntity(app.media_id)
                .then(res => {
                    app.media_list_entry_id = res.data.SaveMediaListEntry.id;
                    app.progress = res.data.SaveMediaListEntry.progress;
                });
        },
        is_waiting(){
            return this.state ===  app_state.WAITING_SERVER || this.state === app_state.WAITING_SERVER

        },
        is_url(){
            return this.state === app_state.URL;
        },
        is_token(){
            return this.state === app_state.TOKEN;
        },
        is_no_anime(){
            return this.state === app_state.NO_ANIME;
        },
        is_anime_not_following(){
            return this.state === app_state.ANIME_NOT_FOLLOWING;
        },
        is_anime_following(){
            return this.state === app_state.ANIME_FOLLOWING;
        },
        is_error(){
            return this.state === app_state.ERROR;
        }
    },
    computed:{
        display_title(){
            return this.title.length > 0 ? this.title : this.default_title;
        }
    },
    created: function(){
        authenticator.authenticate()
            .then(a => {
                if(a.isUrlMode()){
                    app.state = app_state.URL;
                    app.url = a.url;
                } else if (a.isTokenMode()) {
                    app.state = app_state.TOKEN;
                } else {
                    app.state = app_state.ERROR;
                }
            })
            .then(() => {
                const crtitle = localStorage.getItem("CRTitle");
                if(crtitle){
                    app.title = crtitle;
                }
            })
            .then(() => {
                if(!app.is_token()) return;

                if(!app.title){
                    app.state = app_state.NO_ANIME;
                    return;
                }

                AnilistAPIConn = getAnilistAPIConnector(authenticator.token);
                app.state = app_state.WAITING_API;

                AnilistAPIConn.queryCurrentUserId()
                    .then(res => {
                        app.user_id = res.data.Viewer.id;
                        return AnilistAPIConn.queryAnimeMediaId(app.title);
                    })
                    .then(res =>{
                        app.media_id = res.data.Media.id;
                        this.url = res.data.Media.siteUrl;
                        this.episodes = res.data.Media.episodes;
                        return AnilistAPIConn.queryAnimeProgress(app.media_id, app.user_id);
                    })
                    .then(res => {
                        if(!res.data.MediaList){
                            app.state = app_state.ANIME_NOT_FOLLOWING;
                        }
                        app.media_list_entry_id = res.data.MediaList.id;
                        app.progress = res.data.MediaList.progress;
                        app.state = app_state.ANIME_FOLLOWING;
                    });
            });
    }
});
