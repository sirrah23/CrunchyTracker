import os
from flask import Flask, render_template

# Initialize app
app = Flask(__name__)

# Set up config
config_file_path = os.path.join(os.path.dirname(__file__), "config", "config.cfg")
app.config.from_pyfile(config_file_path, silent=False)

# Routes...
@app.route("/")
def index():
    client_id = app.config["CLIENT_ID"]
    redirect_uri = app.config["REDIRECT_URI"]
    return render_template("index.html", client_id=client_id, redirect_uri=redirect_uri)