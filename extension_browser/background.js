function updateStorage(request){
    if(request.title){
        localStorage.setItem("CRTitle", request.title);
    }
}

browser.runtime.onMessage.addListener(updateStorage)
