import { useState, useEffect } from "react";
import "./App.css";

const FILTERS = ["todas", "activas", "completadas"];
const SUGGESTED_TODOS = [
  "Estirar 5 minutos",
  "Responder un correo pendiente",
  "Ordenar el escritorio",
  "Tomar agua",
  "Revisar una idea nueva",
];

function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("todos");
    return saved ? JSON.parse(saved) : [
      { id: 1, text: "Aprender React", done: true },
      { id: 2, text: "Hacer el deploy en OVHcloud", done: false },
      { id: 3, text: "Tomar café ☕", done: false },
    ];
  });
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("todas");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [suggestion, setSuggestion] = useState(SUGGESTED_TODOS[0]);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setTodos([...todos, { id: Date.now(), text: trimmed, done: false }]);
    setInput("");
  };

  const toggleTodo = (id) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = (id) => {
    if (!editText.trim()) return;
    setTodos(todos.map((t) => (t.id === id ? { ...t, text: editText.trim() } : t)));
    setEditingId(null);
  };

  const clearCompleted = () => {
    setTodos(todos.filter((t) => !t.done));
  };

  const pickSuggestion = () => {
    const available = SUGGESTED_TODOS.filter((item) => item !== suggestion);
    const nextPool = available.length ? available : SUGGESTED_TODOS;
    const nextSuggestion =
      nextPool[Math.floor(Math.random() * nextPool.length)];
    setSuggestion(nextSuggestion);
  };

  const addSuggestedTodo = () => {
    setTodos([
      ...todos,
      { id: Date.now(), text: suggestion, done: false },
    ]);
    pickSuggestion();
  };

  const filtered = todos.filter((t) => {
    if (filter === "activas") return !t.done;
    if (filter === "completadas") return t.done;
    return true;
  });

  const remaining = todos.filter((t) => !t.done).length;

  return (
    <div className="app">
      <div className="noise" />
      <div className="container">
        <header>
          <div className="tag">TASK MANAGER</div>
          <h1>
            <span className="title-main">todo</span>
            <span className="title-accent">.</span>
          </h1>
          <p className="subtitle">{remaining} tareas pendientes</p>
        </header>

        <div className="input-row">
          <input
            className="main-input"
            type="text"
            placeholder="Nueva tarea..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <button className="add-btn" onClick={addTodo}>
            <span>+</span>
          </button>
        </div>

        <div className="suggestion-card">
          <div>
            <p className="suggestion-label">idea rapida</p>
            <p className="suggestion-text">{suggestion}</p>
          </div>
          <div className="suggestion-actions">
            <button className="ghost-btn" onClick={pickSuggestion}>
              Cambiar
            </button>
            <button className="ghost-btn accent" onClick={addSuggestedTodo}>
              Agregar
            </button>
          </div>
        </div>

        <div className="filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <ul className="todo-list">
          {filtered.length === 0 && (
            <li className="empty-state">No hay tareas aquí 🎉</li>
          )}
          {filtered.map((todo, i) => (
            <li
              key={todo.id}
              className={`todo-item ${todo.done ? "done" : ""}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <button
                className={`check-btn ${todo.done ? "checked" : ""}`}
                onClick={() => toggleTodo(todo.id)}
              >
                {todo.done && "✓"}
              </button>

              {editingId === todo.id ? (
                <input
                  className="edit-input"
                  value={editText}
                  autoFocus
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(todo.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  onBlur={() => saveEdit(todo.id)}
                />
              ) : (
                <span
                  className="todo-text"
                  onDoubleClick={() => startEdit(todo)}
                >
                  {todo.text}
                </span>
              )}

              <div className="todo-actions">
                <button
                  className="action-btn edit"
                  onClick={() => startEdit(todo)}
                  title="Editar"
                >
                  ✎
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => deleteTodo(todo.id)}
                  title="Eliminar"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>

        {todos.some((t) => t.done) && (
          <div className="footer">
            <button className="clear-btn" onClick={clearCompleted}>
              Limpiar completadas
            </button>
          </div>
        )}

        <div className="stats">
          <div className="stat">
            <span className="stat-num">{todos.length}</span>
            <span className="stat-label">total</span>
          </div>
          <div className="stat">
            <span className="stat-num">{todos.filter((t) => t.done).length}</span>
            <span className="stat-label">hechas</span>
          </div>
          <div className="stat">
            <span className="stat-num">{remaining}</span>
            <span className="stat-label">pendientes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
