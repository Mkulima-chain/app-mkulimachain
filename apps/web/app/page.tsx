import { redirect } from "@/i18n/routing";

// This page only renders when the user is on `/`
// The middleware will redirect to the correct locale
export default function RootPage() {
  redirect({ href: "/", locale: "ln" });
}
