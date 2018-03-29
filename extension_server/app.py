import os
import json
from flask import Flask, request
from flask_cors import CORS
from token_manager import AnilistTokenManager

# Initialize app
app = Flask(__name__)
CORS(app)  #TODO: DEV mode only?

# Set up config
config_file_path = os.path.join(os.path.dirname(__file__), "config", "config.cfg")
app.config.from_pyfile(config_file_path, silent=False)

# Set up the token manager using the configurations
token_manager = AnilistTokenManager(app.config["CLIENT_ID"], app.config["CLIENT_SECRET"], app.config["REDIRECT_URI"])

# Routes...
@app.route("/", methods=["GET"])
def index():
    code = request.args.get("code")
    if not code:
        return "Something went wrong...", 400
    res = token_manager.request_token(code)
    if res:
        return "Success", 200
    else:
        return "Something went wrong...", 400

@app.route("/get_auth_url_or_token", methods=["GET"])
def get_auth_url_or_token():
    if token_manager.have_access_token():
        res = {"success": True, "type": "token", "data": token_manager.token}
    else:
        res = {"success": True, "type": "url", "data": token_manager.generate_auth_code_url()}
    return json.dumps(res)
