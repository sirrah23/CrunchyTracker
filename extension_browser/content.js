let title = null;
const els = document.getElementsByTagName("span");
for(let i = 0; i < els.length; i++){
    prop = els[i].getAttribute("itemprop");
    if(prop && prop==="title"){
        title = els[i].innerHTML;
        //NOTE: There is an "Anime" title floating around 
        //on the page for some reason...skip it
        if(title && title === "Anime") 
            title = null;
        else
            break;
    }
}

browser.runtime.sendMessage({"title": title});
