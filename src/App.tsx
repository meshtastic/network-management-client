import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { listen, Event } from "@tauri-apps/api/event";
import { useDispatch, useSelector } from "react-redux";
import { actions as counterActions } from "@features/counter/counterSlice";
import * as demoAPIActions from "@features/demoAPI/demoAPIActions";
import type { RootState } from "@store/index";
import reactLogo from "./assets/react.svg";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [messageResult, setMessageResult] = useState("");

  const dispatch = useDispatch();
  const count = useSelector((state: RootState) => state.counter.value);

  const sendMessage = async () => {
    await invoke("js2rs", { message });
  };

  void listen('rs2js', (event: Event<string>) => {
    setMessageResult(event.payload);
  });

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      <div>
        <div>
          <input
            id="greet-input"
            onChange={(e) => setMessage(e.currentTarget.value)}
            placeholder="Enter a message..."
          />
          <button type="button" onClick={() => void sendMessage()}>
            Send Message
          </button>
        </div>
      </div>

      <p>{messageResult}</p>

      <div>
        <div>
          <button
            type="button"
            onClick={() => dispatch(counterActions.increment())}
          >
            Add 1
          </button>
          <button
            type="button"
            onClick={() => dispatch(counterActions.decrement())}
          >
            Sub 1
          </button>
        </div>
      </div>

      <p>{count}</p>

      <div>
        <div>
          <button
            type="button"
            onClick={() => dispatch(demoAPIActions.requestDemoAPI())}
          >
            Increment by Random Number
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
