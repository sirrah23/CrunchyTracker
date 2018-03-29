import os
import json
from flask import Flask, request
from flask_cors import CORS
import requests

# Initialize app
app = Flask(__name__)
CORS(app)

token = None

# Set up config
config_file_path = os.path.join(os.path.dirname(__file__), "config", "config.cfg")
app.config.from_pyfile(config_file_path, silent=False)

# Routes...
@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        print(request.data)
    else:
        global token
        code = request.args.get("code")
        if code:
            token_response = requests.post("https://anilist.co/api/v2/oauth/token", data={
                "grant_type": "authorization_code", 
                "client_id": app.config["CLIENT_ID"], 
                "client_secret": app.config["CLIENT_SECRET"], 
                "redirect_uri": "http://localhost:5000",
                "code": code
            })
            token = token_response.json()["access_token"]
        return "Success"

@app.route("/get_auth_code_link", methods=["GET"])
def get_auth_code_link():
    if token:
        print("We have a token: {}".format(token))
    client_id = app.config["CLIENT_ID"]
    redirect_uri = app.config["REDIRECT_URI"]
    auth_url = "https://anilist.co/api/v2/oauth/authorize?client_id={}&redirect_uri={}&response_type=code".format(client_id, redirect_uri)
    return json.dumps({"success": True, "data": auth_url})

@app.route("/token_droppoint", methods=["POST"])
def gather_token():
   print(request.data) 