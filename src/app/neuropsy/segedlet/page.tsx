import sections from "@/data/neuropsySegedlet.json";
import SegedletClient from "./SegedletClient";

export default function NeuropsySegedletPage() {
  return <SegedletClient sections={sections} />;
}
