import { TodoList } from "@/components/todo-list";
import { tausi } from "@/lib/tausi";

export const metadata = { title: "My todos" };

export default async function TodosPage() {
  // Verifies the session with Tausi (redirects to /sign-in when signed out).
  const { user } = await tausi.requireAuth({ returnTo: "/todos" });
  return (
    <section className="card">
      <h1>{user.firstName ?? user.name.split(" ")[0]}&apos;s todos</h1>
      <TodoList />
    </section>
  );
}
