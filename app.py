from flask import Flask, render_template, request, jsonify
import time
from karatsuba import karatsuba, naive_multiply

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/karatsuba", methods=["POST"])
def api_karatsuba():
    data = request.get_json()
    try:
        x = int(data["x"])
        y = int(data["y"])
    except (KeyError, ValueError):
        return jsonify({"error": "Números inválidos"}), 400

    start = time.perf_counter()
    result = karatsuba(x, y)
    elapsed = time.perf_counter() - start

    return jsonify({
        "result": str(result),
        "time_ms": round(elapsed * 1000, 4),
        "method": "Karatsuba"
    })


@app.route("/api/naive", methods=["POST"])
def api_naive():
    data = request.get_json()
    try:
        x = int(data["x"])
        y = int(data["y"])
    except (KeyError, ValueError):
        return jsonify({"error": "Números inválidos"}), 400

    start = time.perf_counter()
    result = naive_multiply(x, y)
    elapsed = time.perf_counter() - start

    return jsonify({
        "result": str(result),
        "time_ms": round(elapsed * 1000, 4),
        "method": "Ingênuo"
    })


if __name__ == "__main__":
    app.run(debug=True)
