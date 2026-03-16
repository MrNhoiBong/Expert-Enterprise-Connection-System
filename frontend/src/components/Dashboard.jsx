import { useParams } from "react-router-dom";
import ExpertFunctions from "./ExpertFunctions";
import FoundationFunctions from "./FoundationFunctions";

export default function Dashboard() {
  const { role } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard - {role}</h1>
      {role === "expert" || role === "enterprise" ? (
        <ExpertFunctions />
      ) : role === "foundation" ? (
        <FoundationFunctions />
      ) : (
        <p>No functions available</p>
      )}
    </div>
  );
}
