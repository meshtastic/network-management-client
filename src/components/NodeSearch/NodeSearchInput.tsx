import React from 'react';

export interface INodeSearchInputProps {
  query: string;
  setQuery: (value: string) => void;
}

const NodeSearchInput = ({ query, setQuery }: INodeSearchInputProps) => {
  return (
    <div className="flex-grow">
      <input
        className="w-full h-full px-4 py-3 default-overlay font-sans text-base font-normal text-gray-500 placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-gray-300"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for nodes"
      />
    </div>
  )
};

export default NodeSearchInput;
