import { getInput } from '@actions/core'
import { IPolicyExpressionParams } from './policy-creator'

export function retrieveNumericInput(inputKey: string, required: boolean = false): number {
    const inputValue: string = getInput(inputKey, { required })
    if (!inputValue) {
        throw new Error(`Expected a value for ${inputKey}, but none was set`)
    }

    try {
        return parseInt(inputValue)
    } catch {
        throw new Error(`Invalid value for '${inputKey}': ${inputValue}`)
    }
}

export function retrievePolicyEpressionParams(): IPolicyExpressionParams {
    return {
        maxCritical: retrieveNumericInput('max-critical'),
        maxHigh: retrieveNumericInput('max-high'),
        maxMedium: retrieveNumericInput('max-medium'),
        maxLow: retrieveNumericInput('max-low')
    }
}