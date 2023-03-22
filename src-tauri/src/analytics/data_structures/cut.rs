use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Cut {
    weight: f64,
    a: String,
    b: String,
}

impl Cut {
    pub fn new(weight: f64, a: String, b: String) -> Cut {
        Cut { weight, a, b }
    }

    pub fn get_weight(&self) -> f64 {
        self.weight
    }

    pub fn get_a(&self) -> &String {
        &self.a
    }

    pub fn get_b(&self) -> &String {
        &self.b
    }
}
