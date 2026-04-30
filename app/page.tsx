import { redirect } from "next/navigation";

// Root "/" → send to /login (proxy handles redirect to /app if already logged in)
export default function RootPage() {
  redirect("/login");
}
