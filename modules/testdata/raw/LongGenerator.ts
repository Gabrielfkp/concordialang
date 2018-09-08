import { RandomLong } from '../random/RandomLong';
import { MinMaxChecker } from '../util/MinMaxChecker';
import { LongLimits } from '../limits/LongLimits';
import { RawDataGenerator } from './RawDataGenerator';
import { RangeAnalyzer } from './RangeAnalyzer';

/**
 * Long generator.
 *
 * @author Thiago Delgado Pinto
 */
export class LongGenerator implements RawDataGenerator< number >, RangeAnalyzer {

    private readonly _min: number;
    private readonly _max: number;

	/**
	 * Constructor.
	 *
	 * @param _random	Random generator
	 * @param min		Minimum value. Optional. Assumes the minimum long if undefined.
	 * @param max		Maximum value. Optional. Assumes the maximum long if undefined.
	 *
	 * @throws Error In case of invalid values.
	 */
    constructor(
		private _random: RandomLong,
		min?: number,
		max?: number
	) {
		( new MinMaxChecker() ).check( min, max ); // may throw Error

        this._min = min !== null && min !== undefined ? min: LongLimits.MIN;
		this._max = max !== null && max !== undefined ? max: LongLimits.MAX;
	}

	public diff(): number {
		return this._max - this._min;
	}

	// RANGE ANALYSIS

	/** @inheritDoc */
	public hasValuesBetweenMinAndMax(): boolean {
		return this.diff() > 0;
	}

	/** @inheritDoc */
	public hasValuesBelowMin(): boolean {
		return this._min > LongLimits.MIN;
	}

	/** @inheritDoc */
	public hasValuesAboveMax(): boolean {
		return this._max < LongLimits.MAX;
	}

	/** @inheritDoc */
	public isZeroBetweenMinAndMax(): boolean {
		return this._min <= 0 && 0 <= this._max;
	}

	/** @inheritDoc */
    public isZeroBelowMin(): boolean {
		return 0 < this._min;
	}

	/** @inheritDoc */
    public isZeroAboveMax(): boolean {
		return 0 > this._max;
	}

	// DATA GENERATION

	/** @inheritDoc */
	public lowest(): number {
		return LongLimits.MIN;
	}

    /** @inheritDoc */
	public randomBelowMin(): number {
		return ( this.hasValuesBelowMin() )
			? this._random.before( this._min )
			: this.lowest();
	}

    /** @inheritDoc */
	public justBelowMin(): number {
		return ( this.hasValuesBelowMin() )
			? this._min - 1
			: this.lowest();
	}

    /** @inheritDoc */
	public min(): number {
		return this._min;
	}

    /** @inheritDoc */
	public justAboveMin(): number {
		return ( this.hasValuesBetweenMinAndMax() )
			? this._min + 1
			: this._min;
	}

    /** @inheritDoc */
    public zero(): number {
        return 0;
    }

    /** @inheritDoc */
	public median(): number {
		return this._min + ( this.diff() / 2 );
	}

    /** @inheritDoc */
	public randomBetweenMinAndMax(): number {
        return this.hasValuesBetweenMinAndMax()
            ? this._random.between( this._min + 1, this._max - 1 )
            : this._min;
	}

    /** @inheritDoc */
    public justBelowMax(): number {
        return this.hasValuesBetweenMinAndMax()
            ? this._max - 1
            : this._max;
	}

    /** @inheritDoc */
	public max(): number {
		return this._max;
	}

    /** @inheritDoc */
    public justAboveMax(): number {
        return this.hasValuesAboveMax()
            ? this._max + 1
            : this.greatest()
	}

    /** @inheritDoc */
	public randomAboveMax(): number {
		return this.hasValuesAboveMax()
			? this._random.after( this._max )
			: this.greatest();
	}

	/** @inheritDoc */
	public greatest(): number {
		return LongLimits.MAX;
	}

}