import { redirect } from "next/navigation"

/* Final submission lives in the abstracts dashboard; this older page only
   offered accepted abstracts and saved no file. */
export default function Page() {
  redirect("/dashboard/abstracts")
}
