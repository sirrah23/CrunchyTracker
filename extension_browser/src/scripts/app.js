const authenticator = new Authenticator();

// Is there a better place to put these variables?
let AnilistAPIConn;

const app = new Vue({
    el: "#app",
    data: {
        "mode": null,
        "url": null,
        "default_title": "No anime yet",
        "error_message": "Something went wrong",
        "title": "",
        "url": "",
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
                    app.mode = "URL";
                    app.url = a.url;
                } else if (a.isTokenMode()) {
                    app.mode = "TOKEN";
                } else {
                    app.mode = "ERROR";
                }
            })
            .then(() => {
                const crtitle = localStorage.getItem("CRTitle");
                if(crtitle){
                    app.title = crtitle;
                }
            })
            .then(() => {
                if(app.mode === "TOKEN")
                    AnilistAPIConn = getAnilistAPIConnector(authenticator.token);
                if(!app.title)
                    return;
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
                        if(!res.data.MediaList) return; //Not Following
                        app.media_list_entry_id = res.data.MediaList.id;
                        app.progress = res.data.MediaList.progress;
                    });
            });
    }
});
