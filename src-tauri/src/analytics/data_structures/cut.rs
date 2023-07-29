use serde::{Deserialize, Serialize};

use crate::state::NodeKey;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Cut {
    weight: f64,
    a: NodeKey,
    b: NodeKey,
}

impl Cut {
    pub fn new(weight: f64, a: NodeKey, b: NodeKey) -> Cut {
        Cut { weight, a, b }
    }

    pub fn get_weight(&self) -> f64 {
        self.weight
    }

    pub fn get_a(&self) -> &NodeKey {
        &self.a
    }

    pub fn get_b(&self) -> &NodeKey {
        &self.b
    }
}
