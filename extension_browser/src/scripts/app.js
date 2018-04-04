const authenticator = new Authenticator();

const app = new Vue({
    el: "#app",
    data: {
        "mode": null,
        "url": null,
        "default_title": "No anime yet",
        "error_message": "Something went wrong",
        "title": "",
        progress: -1
    },
    computed:{
        display_title(){
            return this.title.length > 0 ? this.title : this.default_title;
        }
    },
    mounted: function(){
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
            });
            /*
            .then(() => {
                Fetch progress # for anime title here
            })
            */
    }
});
