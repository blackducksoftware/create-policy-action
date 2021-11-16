# WIP
This action is in development and not ready for production use.

# Create Black Duck Policy Action
A GitHub action that will create a policy within a specified Black Duck instance

# Parameters
## Required
- blackduck-url: string
- blackduck-api-token: string
## Optional
- max-critical: number
  - default: 0
- max-high: number
  - default: 0
- max-medium: number
  - default: 10
- max-low: number
  - default: 25