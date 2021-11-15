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

export class PolicyCreator {
    blackDuckRestClient: RestClient

    constructor(blackduckRestClient: RestClient) {
        this.blackDuckRestClient = blackduckRestClient
    }

    async createPolicy(name: string, description: string, ): Promise<IRestResponse<unknown>> {
        const requestBody: IPolicyRule = {
            name, description, 
            enabled: true, 
            overridable: true, 
            severity: 'MAJOR', 
            category: 'Component', 
            expression: {
                operator: "AND",
                expressions: [
                    {
                        name: "CRITICAL_SEVERITY_VULN_COUNT",
                        operation: "GT",
                        parameters: {
                            values: [
                                "0"
                            ],
                            data: [
                                {
                                    data: 0
                                }
                            ]
                        },
                        displayName: "Critical Severity Vulnerability Count",
                        developerScanExpression: true,
                        category: "COMPONENT"
                    }
                ]
            }
        }
        const requestHeaders: IHeaders = {'Content-Type': POLICY_CONTENT_TYPE}
        const requestOptions: IRequestOptions = {additionalHeaders: requestHeaders}
        return this.blackDuckRestClient.create(POLICY_ENDPOINT, requestBody, requestOptions)
    }

}