from flask import Flask, render_template
from routes.generate import generate_bp
from services.embedding import EmbeddingService

app = Flask(__name__)
embedding_service = EmbeddingService()

# Index route (directly in app.py)
@app.route("/")
def index():
    return render_template("index.html") 

# Register other Blueprints (e.g., APIs)
app.register_blueprint(generate_bp)

if __name__ == "__main__":
    app.run(debug=True)