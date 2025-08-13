from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def query_scripts():
    # Extract the 'query' parameter from POST request body (JSON)
    data = request.get_json()
    query = data.get('query', '')

    # print query
    print(f"Received query: {query}")

    # Dummy response
    response_data = [
        {
            "snippet_name": "remove_duplicate",
            "similarity_index": 0.91,  # renamed for better clarity
            "code": "df.dropna()"
        },
        {
            "snippet_name": "replace_null_with_0",
            "similarity_index": 0.87,
            "code": "df.fillna(0)"
        }
    ]
    return jsonify(response_data)


if __name__ == '__main__':
    app.run(debug=True)
