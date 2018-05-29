import { BaseTrackedObservable } from 'tracking/tracked-observable';
import { recordObservation } from '../tracking';
import { processChangedAtom } from '../transaction';
import { equals, MixinFn, MixinProp } from '../utils';
import { SettableDerivable } from './derivable';
import {
    and, AtomPluck, BooleanAnd, BooleanIs, BooleanNot, BooleanOr, derive,
    Derive, is, lens, LensFn, not, or, pluck, Swap, swap, ValueAccessor,
} from './mixins';

/**
 * Atom is the basic state holder in a Derivable world. It contains the actual mutable state. In contrast
 * with other kinds of derivables that only store immutable (constant) or derived state. Should be constructed
 * with the initial state.
 */
export class Atom<V> extends BaseTrackedObservable implements SettableDerivable<V> {
    /**
     * @internal
     * Construct a new atom with the provided initial value.
     *
     * @param value the initial value
     */
    constructor(
        /**
         * @internal
         * Contains the current value of this atom. Note that this field is public for transaction support, should
         * not be used in application code. Use {@link Derivable#get} and {@link Atom#set} instead.
         */
        public _value: V,
    ) {
        super();
    }

    /**
     * @internal
     * The current version of the state. This number gets incremented every time the state changes. Setting the state to
     * an immutable object that is structurally equal to the previous immutable object is not considered a state change.
     */
    version = 0;

    /**
     * Returns the current value of this derivable. Automatically records the use of this derivable when inside a derivation.
     */
    get() {
        recordObservation(this);
        return this._value;
    }

    /**
     * Sets the value of this atom, fires reactors when expected.
     *
     * @param newValue the new state
     */
    set(newValue: V) {
        const oldValue = this._value;
        if (!equals(newValue, oldValue)) {
            this._value = newValue;
            processChangedAtom(this, oldValue, this.version++);
        }
    }

    @MixinProp(ValueAccessor.prototype) value!: V;
    @MixinFn(swap) swap!: Swap<V>;
    @MixinFn(pluck) pluck!: AtomPluck<V>;
    @MixinFn(lens) lens!: LensFn<V>;
    @MixinFn(derive) derive!: Derive<V>;

    @MixinFn(and) and!: BooleanAnd<V>;
    @MixinFn(or) or!: BooleanOr<V>;
    @MixinFn(not) not!: BooleanNot;
    @MixinFn(is) is!: BooleanIs;
}
