import React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import NavigationBacktrace from "@components/NavigationBacktrace";
import TableBody from "@components/Table/TableBody";

export interface ITableLayoutProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  title: string;
  backtrace: string[];
}

// https://stackoverflow.com/questions/32308370/what-is-the-syntax-for-typescript-arrow-functions-with-generics#45576880
const TableLayout = <T,>({
  data,
  columns,
  title,
  backtrace,
}: ITableLayoutProps<T>) => {
  return (
    <div className="flex flex-col w-full h-screen">
      <div className="flex justify-center align-middle px-9 h-20 border-b border-gray-100">
        <NavigationBacktrace className="my-auto mr-auto" levels={backtrace} />
      </div>

      <div className="px-9 py-6 overflow-x-hidden overflow-y-auto">
        <TableBody title={title} data={data} columns={columns} />
      </div>
    </div>
  );
};

export default TableLayout;
