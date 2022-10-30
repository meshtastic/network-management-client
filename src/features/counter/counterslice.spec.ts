import counterReducer, { counterActions, initialCounterState } from "./counterSlice"

describe("Counter slice functionality", () => {
    it("should increment by one on increment action", () => {
        const incrementAction = counterActions.increment();
        const result = counterReducer(initialCounterState, incrementAction);
        expect(result.value).toEqual(1);
    });

    it("should decrement by one on decrement action", () => {
        const decrementAction = counterActions.decrement();
        const result = counterReducer(initialCounterState, decrementAction);
        expect(result.value).toEqual(-1);
    });

    it("should decrement by given value on increment by amount action", () => {
        const incrementByAmountAction = counterActions.incrementByAmount(2);
        const result = counterReducer(initialCounterState, incrementByAmountAction);
        expect(result.value).toEqual(2);
    });
});
