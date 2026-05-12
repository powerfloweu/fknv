import sections from "@/data/idegzavarokSegedlet.json";
import SegedletClient from "./SegedletClient";

export default function IdegzavarokSegedletPage() {
  return <SegedletClient sections={sections} />;
}
