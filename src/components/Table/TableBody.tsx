import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export interface ITableBodyProps<T> {
  title: string;
  data: T[];
  columns: ColumnDef<T, unknown>[];
}

// https://stackoverflow.com/questions/32308370/what-is-the-syntax-for-typescript-arrow-functions-with-generics#45576880
const TableBody = <T,>({ title, data, columns }: ITableBodyProps<T>) => {
  const table = useReactTable<T>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <div className="">
        <div className="flex flex-row justify-between">
          <h1 className="text-4xl leading-10 font-semibold text-gray-700 dark:text-gray-300">
            {title}
          </h1>
          {/* <input
              placeholder="Search waypoints..."
              className="border-2 border-gray-200 text-gray-400 rounded-lg pl-2"
            /> */}
        </div>
      </div>

      <div>
        <table className="mt-9 w-full">
          {/* Header element */}
          <thead className="text-gray-600 dark:text-gray-400 text-xs leading-4 font-semibold">
            {table.getHeaderGroups().map((headerGroup) => (
              // Row to contain header data
              <tr
                key={headerGroup.id}
                // TODO how do we update the divider color of a table?
                className="border-b-2 border-gray-200 dark:border-gray-500 border-solid"
              >
                {headerGroup.headers.map((header) => (
                  // Mapping each header into the row
                  <th key={header.id} className="text-left pl-5 pb-5">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="p-5 text-gray-500 dark:text-gray-400 text-sm leading-5 font-normal border-b border-gray-300 dark:border-gray-500"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableBody;
