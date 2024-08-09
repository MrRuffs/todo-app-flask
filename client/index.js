getTodos()

async function onTodoSubmit(event) {
    event.preventDefault()
    try {
        const todo = document.getElementById("todoText").value

        if (todo === "") {
            throw Error("Invalid todo")
        }
            

        let resp = await fetch("http://127.0.0.1:5000/save-todos", {
            method: 'POST',  // Specify the method
            headers: {
                'Content-Type': 'application/json'  // Indicate the content type is JSON
            },
            body: JSON.stringify({ task: todo })  // Convert the todo item to JSON
        });

        getTodos()

        document.getElementById("todoText").value = ""
    } catch (error) {
        alert(error.message)
        console.log(error.message)
    }
}

async function getTodos() {
    try {
        let response = await fetch("http://127.0.0.1:5000/get-todos");
        
        const todoDiv = document.getElementById("todoDiv");
        const completedDiv = document.getElementById("completedDiv");

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const todos = await response.json();
        
        console.log('Todos:', todos);

        // Clear existing todos from both sections
        todoDiv.innerHTML = '';
        completedDiv.innerHTML = '';

        todos.forEach((todo) => {
            // Create the todo element
            let newTodo = document.createElement("div");
            newTodo.className = "todo-item";
            newTodo.setAttribute('data-id', todo.id);

            let todoTxt = document.createElement("span");
            todoTxt.textContent = todo.task;

            let buttonContainer = document.createElement("div");
            buttonContainer.className = "button-container";

            let deleteButton = document.createElement("button");
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.className = "delete-button";

            let editButton = document.createElement("button");
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.className = "edit-button";

            let checkButton = document.createElement("button");
            checkButton.innerHTML = '<i class="fas fa-check"></i>';
            checkButton.className = "check-button";

            
            
            let returnButton = document.createElement("button");
            returnButton.innerHTML = '<i class="fas fa-undo"></i>';
            returnButton.className = "return-button";
            returnButton.style.display = 'none'; // Hide return button by default

            buttonContainer.appendChild(deleteButton);
            buttonContainer.appendChild(editButton);
            buttonContainer.appendChild(checkButton);
            buttonContainer.appendChild(returnButton); // Add return button
            
            newTodo.appendChild(todoTxt);
            newTodo.appendChild(buttonContainer);

            if (todo.completed) {
                completedDiv.appendChild(newTodo);
                // Remove the check and edit buttons from completed todos
                newTodo.querySelector('.check-button').remove();
                newTodo.querySelector('.edit-button').remove();
                returnButton.style.display = 'block'; // Show return button for completed todos
            } else {
                todoDiv.appendChild(newTodo);
                returnButton.style.display = 'none'; // Ensure return button is hidden for todos
            }

            // Add click event listeners for buttons
            editButton.addEventListener("click", () => {
                showTab('edit');
                const newTodoRequest = document.getElementById("newTodoInput");
                newTodoRequest.value = todo.task;
                newTodoRequest.dataset.todoId = todo.id;
            });

            checkButton.addEventListener("click", async () => {
                try {
                    let resp = await fetch("http://127.0.0.1:5000/update-todo", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ id: todo.id })
                    });

                    if (!resp.ok) {
                        throw new Error('Failed to update the todo');
                    }

                    // Move the todo to the completed section
                    todoDiv.removeChild(newTodo);
                    completedDiv.appendChild(newTodo);
                    newTodo.querySelector('.check-button').remove();
                    newTodo.querySelector('.edit-button').remove();
                    newTodo.querySelector('.return-button').style.display = 'block'; // Show return button

                } catch (error) {
                    console.log(error.message);
                }
            });

            deleteButton.addEventListener("click", async () => {
                try {
                    if (todoDiv.contains(newTodo)) {
                        todoDiv.removeChild(newTodo);
                    }
                    if (completedDiv.contains(newTodo)) {
                        completedDiv.removeChild(newTodo);
                    }
                    
                    let resp = await fetch("http://127.0.0.1:5000/delete-todo", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ id: todo.id })
                    });

                    if (!resp.ok) {
                        throw new Error('Failed to delete the todo');
                    }

                } catch (error) {
                    console.log(error.message);
                }
            });

            returnButton.addEventListener("click", async () => {
                try {
                    let resp = await fetch("http://127.0.0.1:5000/uncomplete-todo", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ id: todo.id })
                    });

                    if (!resp.ok) {
                        throw new Error('Failed to return the todo');
                    }

                    // Move the todo back to the todo section
                    completedDiv.removeChild(newTodo);
                    todoDiv.appendChild(newTodo);

                    // Re-add the check and edit buttons
                    let checkButton = document.createElement("button");
                    checkButton.innerHTML = '<i class="fas fa-check"></i>';
                    checkButton.className = "check-button";
                    let editButton = document.createElement("button");
                    editButton.innerHTML = '<i class="fas fa-edit"></i>';
                    editButton.className = "edit-button";

                    // Add the new buttons to the button container
                    buttonContainer.appendChild(editButton);
                    buttonContainer.appendChild(checkButton);
                    

                    newTodo.querySelector('.return-button').style.display = 'none'; // Hide return button
                    newTodo.querySelector('.check-button').style.display = 'block'; // Show check button
                    newTodo.querySelector('.edit-button').style.display = 'block'; // Show edit button

                    // Re-add event listeners for the new buttons
                    checkButton.addEventListener("click", async () => {
                        try {
                            let resp = await fetch("http://127.0.0.1:5000/update-todo", {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ id: todo.id })
                            });

                            if (!resp.ok) {
                                throw new Error('Failed to update the todo');
                            }

                            // Move the todo to the completed section
                            todoDiv.removeChild(newTodo);
                            completedDiv.appendChild(newTodo);
                            newTodo.querySelector('.check-button').remove();
                            newTodo.querySelector('.edit-button').remove();
                            newTodo.querySelector('.return-button').style.display = 'block'; // Show return button

                        } catch (error) {
                            console.log(error.message);
                        }
                    });

                    editButton.addEventListener("click", () => {
                        showTab('edit');
                        const newTodoRequest = document.getElementById("newTodoInput");
                        newTodoRequest.value = todo.task;
                        newTodoRequest.dataset.todoId = todo.id;
                    });

                } catch (error) {
                    console.log(error.message);
                }
            });
        });
    } catch (error) {
        console.error('Error:', error);
    }
}


async function addTodo(text) {
    try {
        let newTodo = document.createElement("p")
        newTodo.innerHTML = text
        todoDiv.appendChild(newTodo)
        
    } catch (error) {
        console.error('Error:', error)
    }
}

async function clearAll() {
    try {
        const response = await fetch("http://127.0.0.1:5000/clear-all", {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const body = await response.json();
        console.log(body.message);

        // Clear the UI
        const todoDiv = document.getElementById('todoDiv');
        while (todoDiv.firstChild) {
            todoDiv.removeChild(todoDiv.firstChild);
        }

        // Optionally, add the empty message if needed
        // checkIfEmpty();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function clearAllCompleted() {
    try {
        const response = await fetch("http://127.0.0.1:5000/clear-all-complete", {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const body = await response.json();
        console.log(body.message);

        // Clear the UI
        const completedDiv = document.getElementById("completedDiv");
        while (completedDiv.firstChild) {
            completedDiv.removeChild(completedDiv.firstChild);
        }

        // Optionally, add the empty message if needed
        // checkIfEmpty();
    } catch (error) {
        console.error('Error:', error);
    }
}

// index.js

// Show the appropriate tab content
function showTab(tabName) {
    const todoTab = document.getElementById("todoTab");
    const completedTab = document.getElementById("completedTab");
    const editTab = document.getElementById("editTab");
    const tabButtons = document.querySelectorAll(".tab-button");

    // Save the clicked tab name in localStorage
    localStorage.setItem('activeTab', tabName);

    if (tabName === 'todo') {
        todoTab.style.display = 'block';
        completedTab.style.display = 'none';
        tabButtons[0].classList.add('active');
        editTab.style.display = 'none'
        tabButtons[1].classList.remove('active');
    } else if (tabName === 'completed') {
        todoTab.style.display = 'none';
        completedTab.style.display = 'block';
        editTab.style.display = 'none'
        tabButtons[0].classList.remove('active');
        tabButtons[1].classList.add('active');
    } else if (tabName === 'edit') {
        todoTab.style.display = 'none';
        completedTab.style.display = 'none';
        editTab.style.display = 'block'
        tabButtons[0].classList.remove('active');
        tabButtons[1].classList.remove('active');
    }
}


document.addEventListener("DOMContentLoaded", function() {
    const savedTab = localStorage.getItem('activeTab') || 'todo';

    if (savedTab == null || savedTab == "edit") {
        showTab('todo')
    } else {
        showTab(savedTab);
    }

    
});
