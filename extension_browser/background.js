function updateStorage(request){
    localStorage.setItem("CRTitle", request.message);
}

browser.runtime.onMessage.addListener(updateStorage)
