import { useEffect, type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/utilities/Sidebar";

import DetailProfile from "./Detail";
import GantiEmail from "./Email";
import GantiPassword from "./Password";
import Debug from "./Debug";

const tabs = [
  { key: "detail", label: "Detail", component: <DetailProfile /> },
  { key: "email", label: "Email", component: <GantiEmail /> },
  { key: "password", label: "Password", component: <GantiPassword /> },
  { key: "debug", label: "Debug", component: <Debug /> },
] as const;

type Tab = (typeof tabs)[number]["key"];

export default function Profile(): JSX.Element {
  const { tab } = useParams<{ tab: Tab }>();
  const navigate = useNavigate();

  const activeTab: Tab = tab && tabs.some((t) => t.key === tab) ? (tab as Tab) : "detail";
  const activeContent = tabs.find((t) => t.key === activeTab)?.component ?? null;

  useEffect(() => {
    if (!tab) {
      navigate("/profile/detail", { replace: true });
    }
  }, [tab, navigate]);

  return (
    <div className="flex min-h-screen">
      <Sidebar basePath="/profile" tabs={tabs} activeTab={activeTab} />
      <div className="flex-1 p-4 bg-white">{activeContent}</div>
    </div>
  );
}