from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from pymongo import MongoClient
from bson import ObjectId
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins for simplicity. Adjust for security as needed.

# MongoDB connection setup
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client['todo_db']
todos_collection = db['todos']


def is_collection_empty(collection):
    # Count the number of documents in the collection
    count = collection.count_documents({})
    return count == 0

@app.route('/save-todos', methods=['POST'])
@cross_origin()
def save_todo():
    try:
        data = request.json
        if data and 'task' in data: 
            todos_collection.insert_one({'task': data['task'], 'completed': False})
            return jsonify({"message": "Todo added successfully"}), 201
        return jsonify({"error": "Invalid data"}), 400
    except Exception as e:
        # Log the exception and return a 500 error
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/get-todos', methods=['GET'])
@cross_origin()
def get_todos():
    try:
        todos = todos_collection.find()
        todo_list = [{
            'task': todo['task'], 
            'completed': todo['completed'],
            'id': str(todo['_id']),
        } for todo in todos]
        return jsonify(todo_list)
    except Exception as e:
        # Log the exception and return a 500 error
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error"}), 500
    
@app.route('/clear-all', methods=["DELETE"])
@cross_origin()
def clear_all():
    try:
        todos_collection.delete_many({"completed": False})
        return jsonify({"message": "Todos deleted successfully"}), 201
    except Exception as e:
        # Log the exception and return a 500 error
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error"}), 500
    
@app.route('/clear-all-complete', methods=["DELETE"])
@cross_origin()
def clear_all_complete():
    try:
        todos_collection.delete_many({"completed": True})
        return jsonify({"message": "Todos deleted successfully"}), 201
    except Exception as e:
        # Log the exception and return a 500 error
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error"}), 500
    
@app.route('/delete-todo', methods=["POST"])
@cross_origin()
def delete_todo():
    try:
        body = request.get_json()

        if 'id' not in body or not body['id']:
            raise Exception("Invalid ID")
        
        todo_id = ObjectId(body['id'])

        result = todos_collection.delete_one({"_id": todo_id})
        return jsonify({"message": "Todo deleted successfully"}), 201
    except Exception as e:
        # Log the exception and return a 500 error
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route('/update-todo', methods=["POST"])
@cross_origin()
def update_todo():
    try:
        body = request.get_json()
        

        if 'id' not in body or not body['id']:
            raise Exception("ID invalid")
        
        filter = {'_id': ObjectId(body['id'])}
        update = {'$set': {'completed': True}}

        completed = todos_collection.update_one(filter, update)

        return jsonify({"message": "Todo completed successfully"}), 201
    except Exception as e:
        # Log the exception and return a 500 error
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error"}), 500
    
@app.route('/uncomplete-todo', methods=["POST"])
@cross_origin()
def uncomplete_todo():
    try:
        body = request.get_json()
        
        if 'id' not in body or not body['id']:
            raise Exception("ID invalid")
        
        filter = {'_id': ObjectId(body['id'])}
        update = {'$set': {'completed': False}}

        completed = todos_collection.update_one(filter, update)

        return jsonify({"message": "Todo uncompleted successfully"}), 201
    except Exception as e:
        # Log the exception and return a 500 error
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error"}), 500
    
@app.route('/edit-todo', methods=["POST"])
@cross_origin()
def edit_todo():
    try:
        body = request.get_json()

        if 'id' not in body or not body['id']:
            raise Exception("ID invalid")
        if 'newText' not in body or not body['newText']:
            raise Exception("Invalid request")
        
        filter = {'_id': ObjectId(body['id'])}
        update = {'$set': {'task': body['newText']}}

        completed = todos_collection.update_one(filter, update)

        return jsonify({"message": "Todo edited successfully"}), 201
    except Exception as e:
        # Log the exception and return a 500 error
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error"}), 500
    
# @app.route('/check-empty', methods=["GET"])
# @cross_origin()
# def check_empty():
#     try:
#         if is_collection_empty(todos_collection):
#             return("The collection is empty.")
#         else:
#             return("The collection is not empty.")

#     except Exception as e:
#         print(f"Error: {e}")
#         return jsonify({"error": "Internal server error"}), 500
    


if __name__ == '__main__':
    app.run(debug=True)
