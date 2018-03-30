console.log("******Background script is running!!!******");

function updateStorage(request){
    console.log("******Background script update is running!!!******");
    if(request.title){
        localStorage.setItem("CRTitle", request.title);
    }
}

browser.runtime.onMessage.addListener(updateStorage)
