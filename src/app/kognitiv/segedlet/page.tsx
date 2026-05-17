import sections from "@/data/kognitivSegedlet.json";
import SegedletClient from "./SegedletClient";

export default function KognitivSegedletPage() {
  return <SegedletClient sections={sections} />;
}
