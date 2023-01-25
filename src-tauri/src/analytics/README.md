## **Analytics**

Module for interacting with the network / graph.

The entry-point of this module is `State` struct in [state.rs](./state.rs). `State` accepts two parameters: `config_fields: HashMap<&str, &str>` and `is_save: bool` both of which are passed down to [Timeline](./aux_data_structures/timeline.rs). Former is a hashmap with two keys "timeline_data_dir" and "timeline_label_dir" representing the directory locations in which the data will be saved if `is_save` is true.

&nbsp;

The overall structure of `State` is as below:

```rust
pub struct State {
    timeline: Timeline,
    history: History,
    time: SystemTime,
    algo_configs: AlgoConfig,
    algo_run_mode_auto: bool,
    algo_store: AlgoStore,
    algo_controller: AlgoController,
};
```

All fields of `State` are initialized as empty. When the backend centralizes the network information and creates a `Graph` object, it passes it to `State` as:

```rust
state.add_graph(&graph);
```

which the `state` adds to `state.timeline`.

Since the choice of algorithm to run is left to the user, frontend will send a bitfield of type `u8` to `state` to activate algorithms as:

```rust
state.set_algos(algos_bitfield: u8);
```

`algos_bitfield` can be constructed in the following way:

- To run the articulation point algorithm, the bitfield is 0b00001.
- To run the mincut algorithm, the bitfield is 0b00010.
- To run the diffusion centrality algorithm, the bitfield is 0b00100.
- To run the most similar timeline algorithm, the bitfield is 0b01000.
- To run the predicted state algorithm, the bitfield is 0b10000.
- To run all algorithms, the bitfield is 0b11111.

All other combinations can be derived from above.

&nbsp;

Running **'activated'** algorithms is as simple as calling:

```rust
state.run_algos();
```

In this function, `State` gets the current snapshot from `Timeline` and calls `AlgoController` as:

```rust
self.algo_controller.run_algos(
    &curr_graph,
    &self.algo_configs,
    &mut self.history,
    &mut self.algo_store,
);
```

which itself calls the activated algorithms, stores their results as `Enum` in `AlgoStore` and logs the time in `History` object for each of the algorithms.
