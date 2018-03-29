"""
This file contains a class that can be used to manage
logic that is associated with obtaining an access token
to the Anilist api.
"""
import requests


class AnilistTokenManager:
    """
    A class that can be used to interact with the Anilist api.
    """

    def __init__(self, client_id, client_secret, redirect_uri):
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
        self.code = None
        self.token = None

    def generate_auth_code_url(self):
        """
        Generates the url that can be used to obtain an authorization code
        from the Anilist api.
        """
        template_url = "https://anilist.co/api/v2/oauth/authorize?client_id={}&redirect_uri={}&response_type=code"
        return template_url.format(self.client_id, self.redirect_uri)

    def have_access_token(self):
        """
        Indicates whether or not we have already have an access token.
        """
        return self.token is not None

    def request_token(self, code):
        """
        Given an authorization code attempt to request an access code from
        the Anilist API.
        """
        if not code:
            return False
        self.code = code
        token_url = "https://anilist.co/api/v2/oauth/token"
        token_req_data = {
            "grant_type": "authorization_code",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "redirect_uri": self.redirect_uri,
            "code": self.code
        }
        token_response = requests.post(token_url, data=token_req_data)
        if token_response.status_code == requests.codes.ok:
            self.token = token_response.json()["access_token"]
            return True
        else:
            return False
