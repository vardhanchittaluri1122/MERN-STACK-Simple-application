import React, { useState, useEffect } from 'react';
import './App.css';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { BsCheckLg } from 'react-icons/bs';

function App() {
  const [allTodos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [completedTodos, setCompletedTodos] = useState([]);
  const [currentEdit, setCurrentEdit] = useState('');
  const [currentEditedItem, setCurrentEditedItem] = useState('');

  // Fetch all todos
  const fetchTodos = async () => {
    const response = await fetch('http://localhost:8080/api/todos');
    const data = await response.json();
    setTodos(data.filter(item => !item.completed));
    setCompletedTodos(data.filter(item => item.completed));
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Add a new todo
  const handleAddTodo = async () => {
    await fetch('http://localhost:8080/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, description: newDescription }),
    });
    fetchTodos();
    setNewTitle('');
    setNewDescription('');
  };

  // Delete a todo
  const handleDeleteTodo = async (id) => {
    console.log("Deleting ID:", id);
    try {
      const response = await fetch(`http://localhost:8080/api/todos/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Failed to delete");
  
      const data = await response.json(); 
      console.log("Updated Todos:", data.todos);
  
      setTodos(data.todos.filter(todo => !todo.completed));
      setCompletedTodos(data.todos.filter(todo => todo.completed));
    } catch (err) {
      console.error('Error deleting todo:', err.message);
    }
  };
  
  
  

  // Mark as completed
  const handleComplete = async (id) => {
    console.log("Completing ID:", id);
    try {
      const response = await fetch(`http://localhost:8080/api/todos/complete/${id}`, { method: 'PUT' });
      console.log("Response Status:", response.status);
      fetchTodos();
    } catch (err) {
      console.error('Error at complete:', err.message);
    }
  };
  

 
  const handleEdit = (item) => {
    setCurrentEdit(item._id);
    setCurrentEditedItem(item);
  };

  const handleUpdateToDo = async () => {
    await fetch(`http://localhost:8080/api/todos/${currentEdit}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentEditedItem),
    });
    fetchTodos();
    setCurrentEdit('');
  };

  return (
    <div className="App">
      <h1>Minor Project - ToDo List</h1>
      <div className="todo-wrapper">
        <div className="todo-input">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Task Title"
          />
          <input
            type="text"
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            placeholder="Task Description"
          />
          <button onClick={handleAddTodo}>Add</button>
        </div>

        <div className="todo-list">
          {allTodos.map(item => (
            <div key={item._id} className="todo-list-item">
              {currentEdit === item._id ? (
                <div>
                  <input
                    value={currentEditedItem.title}
                    onChange={e =>
                      setCurrentEditedItem({ ...currentEditedItem, title: e.target.value })
                    }
                  />
                  <input
                    value={currentEditedItem.description}
                    onChange={e =>
                      setCurrentEditedItem({ ...currentEditedItem, description: e.target.value })
                    }
                  />
                  <button onClick={handleUpdateToDo}>Update</button>
                </div>
              ) : (
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                 
                  <AiOutlineDelete onClick={() => {
  console.log("Delete clicked for ID:", item._id);
  handleDeleteTodo(item._id);
}} />


                  <BsCheckLg onClick={() => handleComplete(item._id)} />
                  <AiOutlineEdit onClick={() => handleEdit(item)} />
                </div>
              )}
            </div>
          ))}
        </div>

        <h2>Completed Todos</h2>
        <div className="todo-list">
          {completedTodos.map(item => (
            <div key={item._id} className="todo-list-item">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <p>Completed on: {item.completedOn}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
