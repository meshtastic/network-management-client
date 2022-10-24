import { Graph } from "./graph";

class ArticulationPoints extends Graph {
    constructor() {
        super();
        this.articulation_points = [];
        this.time = 0;
    }

    get articulation_points() {
        return this.articulation_points;
    }

    get_articulation_points() {
        var visited = new Map();
        var low = new Map();
        var disc = new Map(); 
        var parent = new Map(); 
        var ap = new Map();

        for (var v in this.nodes) {
            visited.set(v, false);
            parent.set(v, -1);
            ap.set(v, false);
        }

        for (var u in this.nodes) {
            if (visited.get(u) == false) {
                this._dfs(u, visited, disc, low, parent, ap);
            }
        }

        var articulation_points = [];

        for (var v in this.nodes) {
            if (ap.get(v) == true) {
                articulation_points.push(v);
            }
        }
        
        return articulation_points;
    }

    _dfs(u, visited, disc, low, parent, ap) {
        var children = 0;

        visited.set(u, true);
        disc.set(u, this.time);
        low.set(u, this.time);

        this.time += 1;
        var neighbors = this.neighbors[u];

        for (var v in neighbors) {
            if (visited.get(v) == false) {
                children += 1;
                parent.set(v, u);
                this._dfs(v, visited, disc, low, parent, ap);
                low.set(u, Math.min(low.get(u), low.get(v)));
                if (parent.get(u) == -1 && children > 1) {
                    ap.set(u, true);
                }
                if (parent.get(u) != -1 && low.get(v) >= disc.get(u)) {
                    ap.set(u, true);
                }
            } else if (v != parent.get(u)) {
                low.set(u, Math.min(low.get(u), disc.get(v)));
            }
        }
    }
}