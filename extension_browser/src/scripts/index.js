const app_node = document.getElementById("app");

fetch("http://localhost:5000/get_auth_url_or_token", {mode: "cors",})
	.then(res => res.json())
	.then(res_json => {
		if(!res_json.success){
			console.error("Could not fetch data")
		}
		if(res_json.type === "url"){
            let text = "Log into Anilist";
            let url = res_json.data;
            appendURLToApp(text, url);
		} else if (res_json.type === "token") {
			let text = computePopupTextContent("CRTitle", "No anime yet!");
            appendTextToApp(text);
		}
	});

function computePopupTextContent(key, default_value){
	const text = localStorage.getItem(key)
	if(!text) return default_value
	return text
}

function appendTextToApp(text){
    const token_msg_node = document.createTextNode(text);
    app_node.appendChild(token_msg_node);
}

function appendURLToApp(text, link){
    const auth_url_node = document.createElement("a");
    const auth_url_text_node = document.createTextNode(text);
    auth_url_node.append(auth_url_text_node);
    auth_url_node.title = text;
    auth_url_node.href = link;
    app_node.appendChild(auth_url_node);
}

