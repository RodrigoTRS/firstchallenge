const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username );

  if (!user) {
    return response
    .status(404)
    .json({error: 'Mensagem do erro'})
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usernametest = users.find( user => user.username === username );

  if (!usernametest) {

    const User = { 
      id: uuidv4(),
      name,
      username, 
      todos: []
    }
  
    users.push(User);
    
    return response
    .status(201)
    .json(User)

  }
  
  return response
  .status(400)
  .json({error: "Bad Request"})

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response
  .status(201)
  .json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const Todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(Todo);

  return response
  .status(201)
  .json(Todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const Todo = user.todos.find((todo) => todo.id === id);

  if (!Todo) {
    return response
    .status(404)
    .json({ error: "Not Found" })
  }

  Todo.title = title;
  Todo.deadline = deadline;

  const done = Todo.done;

  const todoPrint = {
    title,
    deadline,
    done,
  }

  return response
  .status(201)
  .json(todoPrint);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response
    .status(404)
    .json({ error: "Not Found" })
  }

  todo.done = true;

  return response
  .status(201)
  .send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response
    .status(404)
    .json({ error: "Not Found" })
  }

const todoIndex = user.todos.findIndex(todo => {
  return todo.id === id;
});

user.todos.splice(todoIndex,1);

  return response
  .status(204)
  .send();
});

module.exports = app;