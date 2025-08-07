from flask import Flask
from controllers.generate_controller import generate_bp

app = Flask(__name__)
app.register_blueprint(generate_bp)
