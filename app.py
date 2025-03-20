from flask import Flask, jsonify, request
import random
from typing import List

app = Flask(__name__)

# Function to generate a list of random even numbers
def generate_even_numbers(count: int = 10) -> List[int]:
    """Generate a list of even numbers."""
    if count <= 0:
        raise ValueError("The count of numbers must be a positive integer.")
    
    # Generate 'count' random even numbers
    numbers = [random.randint(1, 100) * 2 for _ in range(count)]
    return numbers

# Endpoint to fetch even numbers
@app.route('/test/evens', methods=['GET'])
def get_even_numbers():
    try:
        # Get query parameter 'count', default is 10
        count = int(request.args.get('count', 10))
        
        # Validate the count to be positive
        if count <= 0:
            return jsonify({"error": "The 'count' parameter must be a positive integer."}), 400

        # Generate even numbers
        even_numbers = generate_even_numbers(count)
        return jsonify({"numbers": even_numbers}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred."}), 500

# Endpoint to calculate and return the average of the numbers
@app.route('/test/calculate_average', methods=['GET'])
def calculate_average():
    try:
        # Get query parameter 'count', default is 10
        count = int(request.args.get('count', 10))

        # Validate the count
        if count <= 0:
            return jsonify({"error": "The 'count' parameter must be a positive integer."}), 400

        # Generate even numbers
        even_numbers = generate_even_numbers(count)
        
        # Calculate the average
        avg = sum(even_numbers) / len(even_numbers) if even_numbers else 0
        
        return jsonify({"numbers": even_numbers, "average": round(avg, 2)}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred."}), 500

if __name__ == '__main__':
    # Run the Flask app with debug mode enabled
    app.run(debug=True)
