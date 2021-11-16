import { IHeaders } from 'typed-rest-client/Interfaces'
import {RestClient, IRestResponse, IRequestOptions } from 'typed-rest-client/RestClient'

export const POLICY_ENDPOINT = '/api/policy-rules'
export const POLICY_CONTENT_TYPE = 'application/vnd.blackducksoftware.policy-5+json'

interface IPolicyRule {
    name: string
    description: string
    enabled: boolean
    overridable: boolean
    severity: string
    category: string
    expression: Object
}

interface IPolicyExpression {
    name: string
    operation: string
    parameters: Object
    displayName: string
    developerScanExpression: boolean
    category: string
}

const policyNameToDisplayName: Map<string, string> = new Map()
policyNameToDisplayName.set('CRITICAL_SEVERITY_VULN_COUNT', 'Critical Severity Vulnerability Count')
policyNameToDisplayName.set('HIGH_SEVERITY_VULN_COUNT', 'High Severity Vulnerability Count')
policyNameToDisplayName.set('MEDIUM_SEVERITY_VULN_COUNT', 'Medium Severity Vulnerability Count')
policyNameToDisplayName.set('LOW_SEVERITY_VULN_COUNT', 'Low Severity Vulnerability Count')

export class IPolicyExpressionParams {
    maxCritical: number = 0
    maxHigh: number = 0
    maxMedium: number = 10
    maxLow: number = 25
}

export class PolicyCreator {
    blackDuckRestClient: RestClient

    constructor(blackduckRestClient: RestClient) {
        this.blackDuckRestClient = blackduckRestClient
    }

    async createPolicy(name: string, description: string, expressionParams: IPolicyExpressionParams = new IPolicyExpressionParams()): Promise<IRestResponse<unknown>> {
        let allExpressions = []
        allExpressions.push(this.createExpressionObject('CRITICAL_SEVERITY_VULN_COUNT', expressionParams.maxCritical))
        allExpressions.push(this.createExpressionObject('HIGH_SEVERITY_VULN_COUNT', expressionParams.maxHigh))
        allExpressions.push(this.createExpressionObject('MEDIUM_SEVERITY_VULN_COUNT', expressionParams.maxMedium))
        allExpressions.push(this.createExpressionObject('LOW_SEVERITY_VULN_COUNT', expressionParams.maxLow))

        const requestBody: IPolicyRule = {
            name, description, 
            enabled: true, 
            overridable: true, 
            severity: 'MAJOR',
            category: 'Component', 
            expression: {
                operator: 'OR',
                expressions: allExpressions
            }
        }
        const requestHeaders: IHeaders = {'Content-Type': POLICY_CONTENT_TYPE}
        const requestOptions: IRequestOptions = {additionalHeaders: requestHeaders}
        return this.blackDuckRestClient.create(POLICY_ENDPOINT, requestBody, requestOptions)
    }

    private createExpressionObject(name: string, value: number): IPolicyExpression {
        return {
            name,
            operation: 'GT',
            parameters: this.createParameters(value),
            displayName: policyNameToDisplayName.get(name) || 'Unknown',
            developerScanExpression: true,
            category: 'COMPONENT'
        }
    }

    private createParameters(value: number): Object {
        return {
            values: [
                '' + value
            ],
            data: [
                {
                    data: value
                }
            ]
        }
    }

}