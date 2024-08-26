"use client";

import { JsonViewer } from "@textea/json-viewer";
import { useState } from "react";

function ErrorMessage({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <div
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <span className="block sm:inline">{message}</span>
    </div>
  );
}

function escapeStringForJSON(input: string): string {
  return input
    .replace(/:\s*"\s+"/g, ': ""') // Remove space between quotes after a colon
    .replace(/""(.*?)""/g, '"\\"$1\\""'); // Escape consecutive double quotes around a string
}

function parseResponseBodyPayload(input: string): any {
  // Replace non-standard escape sequence \\ʺ with standard JSON escape sequence \"
  const formattedInput = input.replace(/\\ʺ/g, '\\"').replace(/\\\"/g, '"');
  console.log("before", input);
  console.log("after", formattedInput);

  try {
    return JSON.parse(formattedInput);
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return input;
  }
}

export function Form() {
  const [value, setValue] = useState<string>();
  const [jsonValue, setJsonValue] = useState();
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!value) {
      setError("No log content");
      return;
    }

    setError(undefined);
    setJsonValue(undefined);

    try {
      const data = JSON.parse(escapeStringForJSON(value));

      if (data["responseBodyPayload"]) {
        data["responseBodyPayload"] = parseResponseBodyPayload(
          data["responseBodyPayload"]
        );
      }

      setJsonValue(data);
    } catch (e) {
      console.log(e);
      setError("Failed parsing JSON");
    }
  };

  return (
    <>
      <ErrorMessage message={error} />
      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-4 w-full max-w-5xl bg-white rounded-md shadow-md"
      >
        <div>
          <label
            htmlFor="log"
            className="block text-sm font-medium text-gray-700"
          >
            Log content
          </label>
          <textarea
            id="log"
            name="log"
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm min-h-[500px]"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Format
        </button>
        <button
          type="reset"
          className="w-full py-2 px-4 bg-white text-indigo-600 font-semibold rounded-md shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
"
          onClick={() => {
            setError(undefined);
            setJsonValue(undefined);
            setValue(undefined);
          }}
        >
          Reset
        </button>
      </form>
      {jsonValue ? (
        <div className="space-y-4 p-4 w-full max-w-5xl bg-white rounded-md shadow-md">
          <JsonViewer value={jsonValue} />
        </div>
      ) : null}
    </>
  );
}
