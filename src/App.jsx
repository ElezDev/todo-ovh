import { useEffect, useState } from "react";
import axios from "axios";
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
  const [query, setQuery] = useState("");
  const [remoteIdea, setRemoteIdea] = useState("");
  const [remoteStatus, setRemoteStatus] = useState("loading");

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const fetchRemoteIdea = async () => {
    setRemoteStatus("loading");

    try {
      const response = await axios.get(
        "https://official-joke-api.appspot.com/random_joke",
      );
      const joke = [response.data.setup, response.data.punchline]
        .filter(Boolean)
        .join(" ");

      setRemoteIdea(joke || "Tomate una pausa y vuelve con una idea nueva.");
      setRemoteStatus("success");
    } catch {
      setRemoteIdea("No pude cargar la idea online por ahora.");
      setRemoteStatus("error");
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadRemoteIdea = async () => {
      try {
        const response = await axios.get(
          "https://official-joke-api.appspot.com/random_joke",
        );
        const joke = [response.data.setup, response.data.punchline]
          .filter(Boolean)
          .join(" ");

        if (ignore) return;

        setRemoteIdea(joke || "Tomate una pausa y vuelve con una idea nueva.");
        setRemoteStatus("success");
      } catch {
        if (ignore) return;

        setRemoteIdea("No pude cargar la idea online por ahora.");
        setRemoteStatus("error");
      }
    };

    loadRemoteIdea();

    return () => {
      ignore = true;
    };
  }, []);

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

  const filtered = todos.filter((todo) => {
    const matchesFilter =
      filter === "activas"
        ? !todo.done
        : filter === "completadas"
          ? todo.done
          : true;
    const matchesQuery = todo.text.toLowerCase().includes(query.toLowerCase().trim());

    return matchesFilter && matchesQuery;
  });

  const completed = todos.filter((t) => t.done).length;
  const remaining = todos.length - completed;
  const progress = todos.length ? Math.round((completed / todos.length) * 100) : 0;
  const hasQuery = query.trim().length > 0;
  const statusLabel =
    progress === 100
      ? "Todo listo"
      : remaining === 0
        ? "Sin tareas activas"
        : `${remaining} por cerrar`;

  const filteredByQueryOnly = todos.filter((todo) => {
    return todo.text.toLowerCase().includes(query.toLowerCase().trim());
  });

  const hasResultsForCurrentFilter = filtered.length > 0;
  const hasResultsIgnoringFilter = filteredByQueryOnly.length > 0;

  const emptyMessage = hasQuery
    ? hasResultsIgnoringFilter
      ? "No hay tareas para esta busqueda con el filtro actual."
      : "No encontre tareas con ese texto."
    : "No hay tareas aqui.";

  const emptyHint = hasQuery
    ? "Prueba otra palabra o cambia el filtro."
    : "Agrega una nueva o usa la idea rapida.";

  const clearSearch = () => {
    setQuery("");
  };

  const visibleTodos =
    filter === "todas"
      ? [...filtered].sort((a, b) => Number(a.done) - Number(b.done))
      : filtered;

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

        <section className="overview-card">
          <div className="overview-top">
            <div>
              <p className="overview-label">avance</p>
              <p className="overview-title">{statusLabel}</p>
            </div>
            <div className="overview-badge">{progress}%</div>
          </div>
          <div className="progress-track" aria-hidden="true">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="overview-meta">
            <span>{completed} hechas</span>
            <span>{remaining} pendientes</span>
            <span>{todos.length} total</span>
          </div>
        </section>

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

        <div className="toolbar">
          <div className="search-wrap">
            <input
              className="search-input"
              type="text"
              placeholder="Buscar tareas..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {hasQuery && (
              <button
                className="search-clear"
                onClick={clearSearch}
                title="Limpiar busqueda"
              >
                ✕
              </button>
            )}
          </div>
          <div className="toolbar-copy">Doble clic para editar</div>
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

        <div className="api-card">
          <div className="api-card-head">
            <div>
              <p className="suggestion-label">api libre</p>
              <p className="api-title">Idea desde internet</p>
            </div>
            <button className="ghost-btn" onClick={fetchRemoteIdea}>
              {remoteStatus === "loading" ? "Cargando..." : "Refrescar"}
            </button>
          </div>
          <p className={`api-copy ${remoteStatus === "error" ? "error" : ""}`}>
            {remoteStatus === "loading"
              ? "Buscando algo nuevo..."
              : remoteIdea}
          </p>
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
          {!hasResultsForCurrentFilter && (
            <li className="empty-state">
              <span className="empty-title">{emptyMessage}</span>
              <span className="empty-copy">{emptyHint}</span>
            </li>
          )}
          {visibleTodos.map((todo, i) => (
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
            <span className="stat-num">{completed}</span>
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
