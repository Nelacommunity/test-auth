"use client";
import { useCallback, useEffect, useState } from "react";
import { useTausi } from "@tausi-auth/js/next/client";
import { describeError } from "@/components/error-text";
import { supabaseFor, type Todo } from "@/lib/supabase";

/**
 * Talks to Supabase straight from the browser. There is no user_id filter in
 * these queries: RLS returns and accepts only the signed-in user's rows, and
 * user_id defaults to the JWT's sub on insert.
 */
export function TodoList() {
  const tausi = useTausi();
  const supabase = supabaseFor(tausi);
  const [todos, setTodos] = useState<Todo[] | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("todos").select("*").order("created_at", { ascending: true });
    if (error) return setError(describeError(error));
    setTodos(data as Todo[]);
  }, [supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = title.trim();
    if (!text) return;
    setBusy(true);
    setError(null);
    const { data, error } = await supabase.from("todos").insert({ title: text }).select().single();
    setBusy(false);
    if (error) return setError(describeError(error));
    setTodos((t) => [...(t ?? []), data as Todo]);
    setTitle("");
  };

  const toggle = async (todo: Todo) => {
    setTodos((t) => t?.map((x) => (x.id === todo.id ? { ...x, done: !x.done } : x)) ?? null);
    const { error } = await supabase.from("todos").update({ done: !todo.done }).eq("id", todo.id);
    if (error) {
      setError(describeError(error));
      void load();
    }
  };

  const remove = async (todo: Todo) => {
    setTodos((t) => t?.filter((x) => x.id !== todo.id) ?? null);
    const { error } = await supabase.from("todos").delete().eq("id", todo.id);
    if (error) {
      setError(describeError(error));
      void load();
    }
  };

  const clearDone = async () => {
    const ids = (todos ?? []).filter((t) => t.done).map((t) => t.id);
    if (!ids.length) return;
    setTodos((t) => t?.filter((x) => !x.done) ?? null);
    const { error } = await supabase.from("todos").delete().in("id", ids);
    if (error) {
      setError(describeError(error));
      void load();
    }
  };

  const left = todos?.filter((t) => !t.done).length ?? 0;

  return (
    <>
      <form className="add" onSubmit={add}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs doing?" maxLength={200} aria-label="New todo" autoFocus />
        <button disabled={busy || !title.trim()}>Add</button>
      </form>
      {error && <p className="error">{error}</p>}
      {todos === null ? (
        <p className="muted">Loading…</p>
      ) : todos.length === 0 ? (
        <p className="muted empty">Nothing to do. Add your first todo above.</p>
      ) : (
        <>
          <ul className="todos">
            {todos.map((t) => (
              <li key={t.id} className={t.done ? "done" : undefined}>
                <label>
                  <input type="checkbox" checked={t.done} onChange={() => toggle(t)} />
                  <span>{t.title}</span>
                </label>
                <button className="ghost icon" onClick={() => remove(t)} aria-label={`Delete "${t.title}"`}>×</button>
              </li>
            ))}
          </ul>
          <footer className="todo-footer">
            <span className="muted">{left} left</span>
            {todos.some((t) => t.done) && <button className="ghost" onClick={clearDone}>Clear completed</button>}
          </footer>
        </>
      )}
    </>
  );
}
