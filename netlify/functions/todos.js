const fs = require('fs').promises;
const path = require('path');

// Caminho para o arquivo JSON
const TODOS_FILE = path.join('/tmp', 'todos.json');

// Função para ler todos do arquivo
async function readTodos() {
  try {
    const data = await fs.readFile(TODOS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Se o arquivo não existir, retorna array vazio
    return [];
  }
}

// Função para salvar todos no arquivo
async function saveTodos(todos) {
  await fs.writeFile(TODOS_FILE, JSON.stringify(todos, null, 2));
}

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Responder a requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    switch (event.httpMethod) {
      case 'GET':
        // Retornar todos os todos
        const todos = await readTodos();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(todos)
        };

      case 'POST':
        // Adicionar novo todo
        const newTodo = JSON.parse(event.body);
        const currentTodos = await readTodos();
        currentTodos.push(newTodo);
        await saveTodos(currentTodos);
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(newTodo)
        };

      case 'PUT':
        // Atualizar todos (substituir completamente)
        const updatedTodos = JSON.parse(event.body);
        await saveTodos(updatedTodos);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updatedTodos)
        };

      case 'DELETE':
        // Deletar todo específico
        const { task } = JSON.parse(event.body);
        const todosToUpdate = await readTodos();
        const filteredTodos = todosToUpdate.filter(todo => todo.task !== task);
        await saveTodos(filteredTodos);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(filteredTodos)
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Método não permitido' })
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno do servidor', details: error.message })
    };
  }
};

