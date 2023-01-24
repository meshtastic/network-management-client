#![allow(dead_code)]

#[derive(Debug)]
pub struct AlgoConfig {
    pub ap: bool,
    pub mincut: bool,
    pub diff_cent: bool,
    pub most_sim_t: bool,
    pub pred_state: bool,
}

impl AlgoConfig {
    pub fn new() -> Self {
        AlgoConfig {
            ap: false,
            mincut: false,
            diff_cent: false,
            most_sim_t: false,
            pred_state: false,
        }
    }

    /// Sets which algos to run.
    ///
    /// # Arguments
    ///
    /// * `self` - The algorithm configuration object.
    /// * `bitfield` - The bitfield of the algorithms.
    /// To run the articulation point algorithm, the bitfield is 0b00001.
    /// To run the mincut algorithm, the bitfield is 0b00010.
    /// To run the diffusion centrality algorithm, the bitfield is 0b00100.
    /// To run the most similar timeline algorithm, the bitfield is 0b01000.
    /// To run the predicted state algorithm, the bitfield is 0b10000.
    /// To run all algorithms, the bitfield is 0b11111.
    pub fn set_algos(&mut self, bitfield: u8) {
        self.set_ap(bitfield & 0b00001 != 0);
        self.set_mincut(bitfield & 0b00010 != 0);
        self.set_diff_cent(bitfield & 0b00100 != 0);
        self.set_most_sim_t(bitfield & 0b01000 != 0);
        self.set_pred_state(bitfield & 0b10000 != 0);
    }

    pub fn set_ap(&mut self, ap: bool) {
        self.ap = ap;
    }

    pub fn set_mincut(&mut self, mincut: bool) {
        self.mincut = mincut;
    }

    pub fn set_diff_cent(&mut self, diff_cent: bool) {
        self.diff_cent = diff_cent;
    }

    pub fn set_most_sim_t(&mut self, most_sim_t: bool) {
        self.most_sim_t = most_sim_t;
    }

    pub fn set_pred_state(&mut self, pred_state: bool) {
        self.pred_state = pred_state;
    }

    pub fn get_ap(&self) -> bool {
        self.ap
    }

    pub fn get_mincut(&self) -> bool {
        self.mincut
    }

    pub fn get_diff_cent(&self) -> bool {
        self.diff_cent
    }

    pub fn get_most_sim_t(&self) -> bool {
        self.most_sim_t
    }

    pub fn get_pred_state(&self) -> bool {
        self.pred_state
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_set_algos() {
        let mut algo_config = AlgoConfig::new();
        algo_config.set_algos(0b00111);
        assert_eq!(algo_config.get_ap(), true);
        assert_eq!(algo_config.get_mincut(), true);
        assert_eq!(algo_config.get_diff_cent(), true);
        assert_eq!(algo_config.get_most_sim_t(), false);
        assert_eq!(algo_config.get_pred_state(), false);

        println!("algo_config: {:?}", algo_config);
    }
}
