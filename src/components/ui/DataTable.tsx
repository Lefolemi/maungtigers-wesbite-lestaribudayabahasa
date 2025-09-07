import type { ReactNode } from "react";

type Props = {
  headers: string[];
  children: ReactNode;
};

export default function DataTable({ headers, children }: Props) {
  return (
    <table className="table-auto w-full border border-sekunder rounded-figma-md overflow-hidden">
      <thead>
        <tr className="bg-sekunder text-white text-left">
          {headers.map((h, i) => (
            <th key={i} className="px-3 py-2">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}