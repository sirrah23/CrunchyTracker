import os
import json
from flask import Flask
from flask_cors import CORS

# Initialize app
app = Flask(__name__)
CORS(app)

# Set up config
config_file_path = os.path.join(os.path.dirname(__file__), "config", "config.cfg")
app.config.from_pyfile(config_file_path, silent=False)

# Routes...
@app.route("/get_auth_code_link", methods=["GET"])
def get_auth_code_link():
    client_id = app.config["CLIENT_ID"]
    redirect_uri = app.config["REDIRECT_URI"]
    auth_url = "https://anilist.co/api/v2/oauth/authorize?client_id={}&redirect_uri={}&response_type=code".format(client_id, redirect_uri)
    return json.dumps({"success": True, "data": auth_url})