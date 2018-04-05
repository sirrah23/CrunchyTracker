const authenticator = new Authenticator();

// Is there a better place to put these variables?
let AnilistAPIConn,
    user_id,
    media_id,
    media_list_entry_id;

const app = new Vue({
    el: "#app",
    data: {
        "mode": null,
        "url": null,
        "default_title": "No anime yet",
        "error_message": "Something went wrong",
        "title": "",
        "url": "",
        progress: -1
    },
    methods:{
        increment_progress(){
            AnilistAPIConn.incrementProgress(media_list_entry_id, this.progress)
                .then(res => app.progress = res.data.UpdateMediaListEntries[0].progress) 
        },
        decrement_progress(){
            AnilistAPIConn.decrementProgress(media_list_entry_id, this.progress)
                .then(res => app.progress = res.data.UpdateMediaListEntries[0].progress) 
        }
    },
    computed:{
        display_title(){
            return this.title.length > 0 ? this.title : this.default_title;
        },
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
                        user_id = res.data.Viewer.id;
                        return AnilistAPIConn.queryAnimeMediaId(app.title);
                    })
                    .then(res =>{
                        media_id = res.data.Media.id;
                        this.url = res.data.Media.siteUrl;
                        return AnilistAPIConn.queryAnimeProgress(media_id, user_id);
                    })
                    .then(res => {
                        if(!res.data.MediaList) return; //Not Following
                        media_list_entry_id = res.data.MediaList.id;
                        app.progress = res.data.MediaList.progress;
                    })
            });
    }
});
