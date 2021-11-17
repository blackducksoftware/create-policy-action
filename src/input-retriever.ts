import { getInput } from '@actions/core'
import { IPolicyExpressionParams } from './policy-creator'

export function retrieveNumericInput(inputKey: string, defaultValue: number, required: boolean = false): number {
    const inputValue: string = getInput(inputKey, { required })
    if (!inputValue) {
        return defaultValue
    }

    try {
        return parseInt(inputValue)
    } catch {
        throw new Error(`Invalid value for '${inputKey}': ${inputValue}`)
    }
}

export function retrievePolicyEpressionParams(): IPolicyExpressionParams {
    return {
        maxCritical: retrieveNumericInput('max-critical', 0),
        maxHigh: retrieveNumericInput('max-high', 0),
        maxMedium: retrieveNumericInput('max-medium', 10),
        maxLow: retrieveNumericInput('max-low', 25)
    }
}